import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';


export function shouldSend(event:any) {
  if(!event.latest_event_timestamp) return true
  try {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 1);

    return currentTime.getTime() > event.latest_event_timestamp;
  } catch(err) {
    console.error('err', err)
  }
}

export async function saveAndExitNoEvent(alert: RawAlertRuleInputWithParsedSensorHash, latest_event: any,  done: (params?: any) => void) {
  try {
    let cachedRecord: any = nodeCache.get(alert.customer_device_id)

    let timestamp = Date.now()
    latest_event.timestamp = timestamp
    cachedRecord.latest_events?.push(latest_event?.length)
    nodeCache.set(cachedRecord.customer_device_id, cachedRecord)
    return done(latest_event)
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}

export async function saveAndExit(alert: RawAlertRuleInputWithParsedSensorHash, latest_event: any,  done: (params?: any) => void) {
  try {
    let cachedRecord: any = nodeCache.get(alert.customer_device_id)
    let timestamp = Date.now()
    latest_event.timestamp = timestamp

    cachedRecord.latest_events.push(latest_event)
    cachedRecord.latest_event_timestamp = timestamp

    nodeCache.set(cachedRecord.customer_device_id, cachedRecord)
    return done(latest_event)
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}