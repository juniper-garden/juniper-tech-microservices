import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';


export function shouldSend(event:any) {
  const currentTime = new Date();

  currentTime.setMinutes(currentTime.getMinutes() - 1);
  // sort events by timestamp
  const transformed = event.map((event: any) => {
    return new Date(event.timestamp).getTime()
  })
  const latest = transformed.sort((a:any, b:any) => {
    return a - b;
  })
  let prevDate = latest[0] || 0;
  return currentTime.getTime() > prevDate;
}

export async function saveAndExitNoEvent(alert: RawAlertRuleInputWithParsedSensorHash, latest_event: any,  done: (params?: any) => void) {
  try {
    let timestamp = Date.now()
    latest_event.timestamp = timestamp
    console.log('before', alert.latest_events?.length)
    alert.latest_events?.push(latest_event?.length)
    console.log('before', alert.latest_events)
    nodeCache.set(alert.customer_device_id, alert)
    return done(latest_event)
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}

export async function saveAndExit(alert: RawAlertRuleInputWithParsedSensorHash, latest_event: any,  done: (params?: any) => void) {
  try {
    let timestamp = Date.now()
    latest_event.timestamp = timestamp
    if(!alert.latest_events) alert.latest_events = []
    console.log('before', alert.latest_events?.length)

    alert.latest_events.push(latest_event)
    alert.last_event_timestamp = timestamp
    console.log('after', alert.latest_events)

    nodeCache.set(alert.customer_device_id, alert)
    return done(latest_event)
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}