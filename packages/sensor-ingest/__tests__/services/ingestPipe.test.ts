import ingestPipe from '../../lib/services/ingestPipe';
import JuniperCore from '@juniper-tech/core';

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

const expectedOutput = {
	bufferSize: "10",
	customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
	name: "",
	sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
}
describe('Ingest Pipe tests', () => {
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
  it('ingest pipe should take data and update redis when provided', async () => {
    await ingestPipe(readingPayload)
		let result = await global.redisk.getOne(SensorBuffer, readingPayload[0].id);
    expect(result).toEqual(expectedOutput)
  })
})