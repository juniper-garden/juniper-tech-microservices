import JuniperCore from '@juniper-tech/core'
import { ReadingsByCustomerId } from '../../lib/services/kafkaSensorRecordProcessor';
import sensorBuffer from '../../lib/services/sensorBuffer';
import { createHashOfDevicesByCustomerDeviceId } from '../../lib/utils/data-sanitization';
import { kinesisTransformer } from '../../lib/utils/helpers';
const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer, JuniperRedisBuffer } = JuniperRedisUtils

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

  it('Should list nothing on instantiation', async () => {
    let results = await global.redisk.list(SensorBuffer);
    expect(results.length).toBe(0);
  })

  it('Should store a new sensor buffer', async () => {
    const readingHash = JSON.stringify({'temp': [{ name: 'temp', value: '20', unit: 'C', timestamp: '2020-01-01T00:00:00.000Z' }]})
    await global.redisk.save(new SensorBuffer('test', 'test', readingHash));
    let results = await global.redisk.list(SensorBuffer);
    expect(JSON.parse(results[0].sensor_readings).temp).toStrictEqual(JSON.parse(readingHash).temp);
  })

  it('Should store a new sensor buffer for a different sensor', async () => {
    const processed: any = readingPayload.map(kinesisTransformer).flat()
    const readingHash:ReadingsByCustomerId  = createHashOfDevicesByCustomerDeviceId(processed)
    await sensorBuffer({ readingsMapped: readingHash })
    let result = await global.redisk.getOne(SensorBuffer, readingPayload[0].id);
    expect(JSON.parse(result.sensor_readings).humidity[0]).toStrictEqual({
      "name": "humidity",
      "timestamp": 1650502574,
      "unit": "C",
      "value": "21.76"
    });
  })
})