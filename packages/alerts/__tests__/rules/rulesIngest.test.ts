
import rulesIngest from '../../lib/rules/rulesIngest';

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
      type: 'pushNotification'
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
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: nonAlertSendingRule
},
{
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0DD",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: nonAlertSendingRule
}]

describe('Tests for rulesIngest function', () => {
  it('Should fetch data by customerId from id array', async () => {
    const res = await rulesIngest(idArr)
    expect(res.events[0].type).toBe('pushNotification')
    expect(res.facts.temperature).toBe(21.76)
    expect(res.results[0].conditions.priority).toBe(1)
  })
})