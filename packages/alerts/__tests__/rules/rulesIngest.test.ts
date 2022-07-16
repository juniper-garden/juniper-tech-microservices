import { RawAlertRuleInput } from '../../lib/customTypes';
import rulesIngest, { sanitizeAlerts } from '../../lib/rules/rulesIngest';
import nodeCache from '../../lib/cache/nodeCache';

const sendAlertRule:any = {
  conditions: {
      any: [{
          all: [{
              fact: 'temperature',
              operator: 'greaterThanInclusive',
              value: 10,
          }, {
              fact: 'humidity',
              operator: 'lessThanInclusive',
              value: 50,
          }]
      }]
  },
  event: {
    type: 'SUCCESS',
    params: [
      {
        type: 'mobilePushNotification'
      },
      {
        type: 'email',
        data: {
          email: "daniel.ashcraft@ofashandfire.com"
        }
      }
    ]
  }
}

const nonAlertSendingRule:any = {
  conditions: {
      any: [{
          all: [{
              fact: 'temperature',
              operator: 'greaterThanInclusive',
              value: 100,
          }, {
              fact: 'humidity',
              operator: 'lessThanInclusive',
              value: 0,
          }]
      }]
  },
  event: {
      type: 'pushNotification'
  }
}


const idArr: RawAlertRuleInput[] = [{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  last_event_timestamp: undefined,
  latest_events: [],
  alert_configs: [sendAlertRule]
},{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0dd",
  sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  last_event_timestamp: undefined,
  latest_events: [],
  alert_configs: [sendAlertRule]
},
{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  sensor_readings: "{\"temperature\":[{\"value\":\"22.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  last_event_timestamp: undefined,
  latest_events: [],
  alert_configs: [nonAlertSendingRule]
}]

describe('Tests for rulesIngest function', () => {
  beforeEach(() => {
    //clear nodeCache
    nodeCache.flushAll()
  })
  it('Should fetch data by customerId from id array', async () => {
    const res:any = await rulesIngest(idArr)
    expect(res).toHaveLength(2)
    expect(res[0].events[0].type).toBe('SUCCESS')
    expect(res[0].events[0].params).toEqual(sendAlertRule.event.params)
    expect(res[0].customer_device_id).toBe("81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad")
    expect(res[0].facts.temperature).toBe(21.76)
    expect(res[0].results[0].conditions.priority).toBe(1)
    expect(res[1].customer_device_id).toBe("81eaec8b-cc5a-4fe1-811c-d996d4bfe0dd")
    expect(res[1].events[0].type).toBe('SUCCESS')
    expect(res[1].events[0].params).toEqual(sendAlertRule.event.params)
    expect(res[1].facts.temperature).toBe(21.76)
    expect(res[1].results[0].conditions.priority).toBe(1)
  })

  it('The santization should correctly filter out duplicate events based on timestamp', () => {
    let results = sanitizeAlerts(idArr)
    expect(results).toHaveLength(2)
    expect(results[0].last_event_timestamp).not.toBeUndefined()
  })
})