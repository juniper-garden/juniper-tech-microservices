import JuniperCore from '@juniper-tech/core'
import rulesIngest from '../../lib/rules/rulesIngest';
const { JuniperRedisUtils } = JuniperCore
const { JuniperRedisBuffer } = JuniperRedisUtils

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


const idArr = [{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: sendAlertRule
},{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0dd",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0dd",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: sendAlertRule
},
{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"22.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: nonAlertSendingRule
}]

describe('Tests for rulesIngest function', () => {
  beforeEach(async() => {
    const redisObjects:any = await JuniperRedisBuffer('redis://localhost:6379')
    global.redisk = redisObjects.redisk
    global.redis = redisObjects.redis
  })

  afterAll(async () => {
    await global.redis.FLUSHDB()
    await global.redisk.close()
    await global.redis.quit()
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
})