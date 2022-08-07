import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';
import fetch from 'isomorphic-fetch'

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
    
    const bodyToPush = JSON.stringify({
      customer_device_id: alert.customer_device_id,
      message: `There was an alert triggered!`,
      raw_event: JSON.stringify(latest_event),
      timestamp: timestamp
    })

    await fetch(process.env.ALERT_NOTIFICATION_WEBHOOK || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: bodyToPush
    })
    return done(latest_event)
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}