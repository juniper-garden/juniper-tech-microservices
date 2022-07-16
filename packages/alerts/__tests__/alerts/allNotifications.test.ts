import allNotificationsHandler from '../../lib/alerts/allNotifications';

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

const alt_input =   {"readings":{"temperature":[{"value":"72.1","unit":"f","timestamp":"1640102575"}]},"alert_config":[{"conditions":{"any":[{"all":[{"fact":"temperature","operator":"greaterThan","value":"50"},{"fact":"temperature","operator":"lessThan","value":"20"}]}]},"event":{"type":"SUCCESS","params":[{"type":"email","data":{"email":"daniel.ashcraft@ofashandfire.com"}}]}},{"conditions":{"any":[{"all":[{"fact":"temperature","operator":"greaterThan","value":"50"},{"fact":"temperature","operator":"lessThan","value":"10"}]}]},"event":{"type":"SUCCESS","params":[{"type":"email","data":{"email":"daniel.ashcraft@ofashandfire.com"}}]}},{"conditions":{"any":[{"all":[{"fact":"temperature","operator":"greaterThan","value":"50"},{"fact":"temperature","operator":"lessThan","value":"10"}]}]},"event":{"type":"SUCCESS","params":[{"type":"email","data":{"email":"daniel.ashcraft@ofashandfire.com"}}]}},{"conditions":{"any":[{"any":[{"fact":"temperature","operator":"greaterThan","value":"50"},{"fact":"temperature","operator":"lessThan","value":"10"}]}]},"event":{"type":"SUCCESS","params":[{"type":"email","data":{"email":"daniel.ashcraft@ofashandfire.com"}}]}}]}

const input = {
  customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
  device_buffer: {
    bufferSize: "10",
    customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    name: "",
    sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
  },
  alert_config: sendAlertRule
}

const expectedOutput = {
	customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
	name: "",
	sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
}

describe("Test the desktop push notification job", () =>{
  it('should send a notification', async () => {
    const testJob: any = {
      data: [
        {
          customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
          events: [
            {
              type: 'SUCCESS',
              params: [
                {
                  type: 'email'
                }
              ]
            }
          ]
        }
      ]
    }
    const done = jest.fn()

    await allNotificationsHandler(testJob, done);
    expect(done).toBeCalledTimes(1);
  })
})