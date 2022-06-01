import JuniperCore from '@juniper-tech/core'
import desktopPushNotifiation from '../../lib/alerts/desktopPushNotification'
const { JuniperRedisUtils } = JuniperCore
const { SensorBuffer, JuniperRedisBuffer } = JuniperRedisUtils

const expectedOutput = {
	customer_device_id: "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
	name: "",
	sensor_readings: "{\"temperature\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"temperature\"}],\"humidity\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"humidity\"}],\"pressure\":[{\"value\":\"21.76\",\"unit\":\"C\",\"timestamp\":1650502574,\"name\":\"pressure\"}]}",
}

describe("Test the desktop push notification job", () =>{
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

  it('should send a notification', async () => {
    let buff  = new SensorBuffer(expectedOutput.customer_device_id, '', expectedOutput.sensor_readings);
    await global.redisk.save(buff)
    let result = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    const job = {
      data: result
    }
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);

    let updated = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    let latestEvents = JSON.parse(updated.latest_events);
    expect(latestEvents[0].event).toBe('desktop_push_notification')
  })

  it('should not send multiple request back to back', async () => {
    let buff  = new SensorBuffer(expectedOutput.customer_device_id, '', expectedOutput.sensor_readings);
    await global.redisk.save(buff)
    let result = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    const job = {
      data: result
    }
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);

    let updated = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    let latestEvents = JSON.parse(updated.latest_events);
    expect(latestEvents[0].event).toBe('desktop_push_notification')

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(1);
  })

  it('should send multiple request after 1 minute', async () => {
    let buff  = new SensorBuffer(expectedOutput.customer_device_id, '', expectedOutput.sensor_readings);
    await global.redisk.save(buff)
    let result = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    const job = {
      data: result
    }
    const done = jest.fn()

    await desktopPushNotifiation(job, done);
    expect(done).toHaveBeenCalled();

    let updated = await global.redisk.getOne(SensorBuffer, expectedOutput.customer_device_id);
    let latestEvents = JSON.parse(updated.latest_events);
    const date = new Date()
    date.setMinutes(date.getMinutes() - 10);
    latestEvents[0].timestamp = date;
    updated.latest_events = JSON.stringify(latestEvents);
    await global.redisk.save(updated)

    await desktopPushNotifiation(job, done);
    expect(done).toBeCalledTimes(2);
  })
})