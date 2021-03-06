import JuniperCore from '@juniper-tech/core'
import desktopPushNotifiation from '../../lib/alerts/desktopPushNotification'
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../../lib/cache/nodeCache';
const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer, JuniperRedisBuffer } = JuniperRedisUtils

const expectedOutput = {
	customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
	name: "",
	sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
}

describe("Test the desktop push notification job", () => {
  beforeEach(() => {
    nodeCache.flushAll()
  })
  xit('should send a notification', async () => {
    let alert: RawAlertRuleInputWithParsedSensorHash  = {
      customer_device_id: expectedOutput.customer_device_id,
      sensor_readings: JSON.parse(expectedOutput.sensor_readings),
      latest_events: [],
      latest_event_timestamp: undefined,
      alert_configs: []
    }

    nodeCache.set(alert.customer_device_id, alert)

    const job: RawAlertRuleInputWithParsedSensorHash[] = [
      alert
    ]
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);

    let updated: RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(alert.customer_device_id)
    let latestEvents = updated?.latest_events
    let latestEvent = latestEvents && latestEvents[0]
    expect(latestEvent.event).toBe('desktopPushNotification')
  })

  xit('should not send multiple requests back to back', async () => {
    let alert: RawAlertRuleInputWithParsedSensorHash  = {
      customer_device_id: expectedOutput.customer_device_id,
      sensor_readings: JSON.parse(expectedOutput.sensor_readings),
      latest_events: [
        {
          type: 'desktopPushNotification',
          timestamp: Date.now()
        }
      ],
      latest_event_timestamp: undefined,
      alert_configs: []
    }

    nodeCache.set(alert.customer_device_id, alert)
    
    const job: RawAlertRuleInputWithParsedSensorHash[] = [
      alert
    ]
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);

    let updated: RawAlertRuleInputWithParsedSensorHash | undefined = nodeCache.get(alert.customer_device_id)

    let latestEvents = updated?.latest_events
    let latestEvent = latestEvents && latestEvents[0]
    expect(latestEvent).toBe('desktopPushNotification')

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);
  })

  xit('should send multiple request after 1 minute', async () => {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() - 5);
    
    let alert: RawAlertRuleInputWithParsedSensorHash  = {
      customer_device_id: expectedOutput.customer_device_id,
      sensor_readings: JSON.parse(expectedOutput.sensor_readings),
      latest_events: [
        {
          type: 'desktopPushNotification',
          timestamp: currentTime.getTime()
        }
      ],
      latest_event_timestamp: undefined,
      alert_configs: []
    }

    nodeCache.set(alert.customer_device_id, alert)
    
    const job: RawAlertRuleInputWithParsedSensorHash[] = [
      alert
    ]
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toHaveBeenCalled();

    let updated: RawAlertRuleInputWithParsedSensorHash | null = nodeCache.get(alert.customer_device_id) || null
    if(!updated) return
    let latestEvents = updated?.latest_events
    let latestEvent = latestEvents?.[0]
    const date = new Date()
    date.setMinutes(date.getMinutes() - 10);
    latestEvent.latest_event_timestamp = date;
    if(updated.latest_events) updated.latest_events[0] = latestEvent
    nodeCache.set(updated.customer_device_id, updated)

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(2);
  })
})