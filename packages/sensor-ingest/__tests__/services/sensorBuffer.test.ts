import { ReadingsByCustomerId } from '../../lib/services/kafkaSensorRecordProcessor';
import sensorBuffer from '../../lib/services/sensorBuffer';
import { createHashOfDevicesByCustomerDeviceId } from '../../lib/utils/data-sanitization';
import { kinesisTransformer } from '../../lib/utils/helpers';
const JGConnection = require('../../lib/db/jg_connection')

jest.mock("../../lib/db/jg_connection", () => {
  const fakePayload = JSON.stringify([
    {
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
  ])
  return {
    query: () => Promise.resolve([[fakePayload], 'test']),
    bulkCreate: jest.fn(() => Promise.resolve())
  }
})

const readingPayload = [{
	"id": "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
	"timestamp": 1650502574,
	"readings": [
		{
			"name": "temperature",
			"unit": "C",
			"value": "21.76"
		},
		{
			"name": "humidity",
			"unit": "C",
			"value": "21.76"
		},
		{
			"name": "pressure",
			"unit": "C",
			"value": "21.76"
		}
	]
}]


describe("Test the redisk/redis connection and saving of sensor data", () => {

  it('Should store a new sensor buffer for a different sensor', async () => {
    const processed: any = readingPayload.map(kinesisTransformer).flat()
    const readingHash:ReadingsByCustomerId  = createHashOfDevicesByCustomerDeviceId(processed)
    console.log('readingHash', readingHash)
    const result =  await sensorBuffer({ readingsMapped: readingHash, finalBatchResults: [{customer_device_id: '', timestamp: 112299}] })
    expect(JSON.parse(result.sensor_readings).humidity[0]).toStrictEqual({
      "name": "humidity",
      "timestamp": 1650502574,
      "unit": "C",
      "value": "21.76"
    });
  })
})