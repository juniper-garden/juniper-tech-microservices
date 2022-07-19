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

    if(cachedRecord && Object.keys(raw_alert.readings).length > 0) {
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
  let keys = Object.keys(raw_alert.readings)
  keys.forEach(inboundKey => {
    if(cached_record.readings[inboundKey].length >= 10) {
      let new_readings = raw_alert.readings[inboundKey].slice(1)
      let old_readings = cached_record.readings[inboundKey].slice(0, -1)
      let combined_readings = old_readings.concat(new_readings)
      cached_record.readings[inboundKey] = combined_readings
      return
    }

    cached_record.readings[inboundKey].concat(raw_alert.readings[inboundKey])
  })
  return cached_record
}


export default async function rulesIngest(data:RawAlertRuleInput[]){
  // group data by id and sort by timestamp then run through rulesEngine
  if(!data.length) {
    return
  }

  // double check alert input is not duplicated and has a rule
  let filterValidAlerts = sanitizeAlerts(data)

  let results = await Promise.all(filterValidAlerts.map(runRules))

  let allTriggeredAlerts:any = results.filter(record => record?.events.length)
  // // common ingress for all event types into the queue
  // if (process.env.USE_QUEUES) {
  //   queues.allNotificationsQ.push({data: allTriggeredAlerts})
  // }
  console.log('allTriggeredAlerts', allTriggeredAlerts)
  return allTriggeredAlerts
}