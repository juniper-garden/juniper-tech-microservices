import { RawAlertRuleInput, RawAlertRuleInputWithParsedSensorHash, TypicalAlertEngineResult } from "../../lib/customTypes"
import _ from "lodash"
import runRules from "./rulesEngine"
import queues from "../../lib/jobs"
import nodeCache from '../cache/nodeCache';

export function sanitizeAlerts(dataWithParsedReadings:any[]): RawAlertRuleInputWithParsedSensorHash[] {
  
  return dataWithParsedReadings
  .reduce((acc: RawAlertRuleInputWithParsedSensorHash[], raw_alert: RawAlertRuleInputWithParsedSensorHash) => {
    if(!raw_alert.customer_device_id) return acc
    let cachedRecord: RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(raw_alert.customer_device_id)

    if(cachedRecord) {
      let updatedRecord = upsertNewReadings(raw_alert, cachedRecord)
      if(updatedRecord.last_event_timestamp > (Date.now() - (5 * 60 * 1000))) return acc
      updatedRecord.last_event_timestamp = Date.now()
      nodeCache.set(raw_alert.customer_device_id, updatedRecord)
      acc.push(updatedRecord)
      return acc
    }

    raw_alert.last_event_timestamp = Date.now()
    raw_alert.latest_events = []
    nodeCache.set(raw_alert.customer_device_id, raw_alert)
    acc.push(raw_alert)
    return acc
  }, [])
}

function upsertNewReadings(raw_alert: RawAlertRuleInputWithParsedSensorHash, cached_record: RawAlertRuleInputWithParsedSensorHash): RawAlertRuleInputWithParsedSensorHash {
  // remove first sensor reading and add new sensor readings to end of array
  let keys = Object.keys(raw_alert.sensor_readings)
  keys.forEach(inboundKey => {
    if(!cached_record.sensor_readings[inboundKey]) {
      cached_record.sensor_readings[inboundKey] = []
    }
    if(cached_record.sensor_readings[inboundKey].length >= 10) {
      let new_readings = raw_alert.sensor_readings[inboundKey].slice(1)
      let old_readings = cached_record.sensor_readings[inboundKey].slice(0, -1) || []
      let combined_readings = old_readings.concat(new_readings)
      cached_record.sensor_readings[inboundKey] = combined_readings
      return
    }
    cached_record.sensor_readings[inboundKey].concat(raw_alert.sensor_readings[inboundKey])
  })
  return cached_record
}


export default async function rulesIngest(data:RawAlertRuleInput[]){
  // group data by id and sort by timestamp then run through rulesEngine
  try {
    if(!data.length) {
      return
    }

    // double check alert input is not duplicated and has a rule
    
    let filterValidAlerts = sanitizeAlerts(data)

    let results = await Promise.all(filterValidAlerts.map(runRules))

    let allTriggeredAlerts:any = results.filter(record => record?.events.length)
    console.log('made it this far', allTriggeredAlerts)
    // // common ingress for all event types into the queue
    if (process.env.USE_QUEUES) {
      queues.allNotificationsQ.push({data: allTriggeredAlerts})
    }
    if(allTriggeredAlerts.length) console.log('allTriggeredAlerts',  allTriggeredAlerts)
    return allTriggeredAlerts
  } catch(err) {
    console.log('err', err)
  }
}