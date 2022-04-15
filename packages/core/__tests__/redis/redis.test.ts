
import { SensorBuffer, insertLatestSensorReading, JuniperRedisBuffer, fetchCustomerDeviceAlertByCustomerId } from '../../lib/redis/juniperRedisUtils';
import { faker } from '@faker-js/faker';
describe("Test the redisk/redis connection and saving of sensor data", () => {
  let redisk: any;
  let redis: any
  const key:string = "super-special-awesome-key"
  
  beforeAll(async () => {
    let redisObjects = await JuniperRedisBuffer('redis://localhost:6379')
    redisk = redisObjects.redisk
    redis = redisObjects.redis
  })

  afterAll(async () => {
    let results = await redisk.list(SensorBuffer);

    for(let i = 0; i < results.length; i++) {
      await redisk.delete(SensorBuffer, results[i].customer_device_id);
    }

    await redis.del(key)

    await redisk.close()
  })
  
  it('Should list nothing on instantiation', async () => {
    let results = await redisk.list(SensorBuffer);
    expect(results.length).toBe(0);
  })

  it('Should store a new sensor buffer', async () => {
    const readings = JSON.stringify([{ name: 'temp', value: '20', unit: 'C', timestamp: '2020-01-01T00:00:00.000Z' }])
    let item = await redisk.save(new SensorBuffer('test', 'test', readings));
    let results = await redisk.list(SensorBuffer);
    

    expect(JSON.parse(results[0].sensor_readings)).toStrictEqual(JSON.parse(readings));
  })

  it('Should store a new sensor buffer', async () => {
    const readingHash = JSON.stringify({'temp': [{ name: 'temp', value: '20', unit: 'C', timestamp: '2020-01-01T00:00:00.000Z' }]})
    await redisk.save(new SensorBuffer('test', 'test', readingHash));
    let results = await redisk.list(SensorBuffer);
    

    expect(JSON.parse(results[0].sensor_readings).temp).toStrictEqual(JSON.parse(readingHash).temp);
  })

  it('Should add new reading to an existing item', async () => {
    const readingRaw = { name: 'temp', value: '20', unit: 'C', timestamp: '2020-01-01T00:00:00.000Z' }
   
    const readingHash = JSON.stringify({'temp': [readingRaw]})
    await redisk.save(new SensorBuffer('test', 'test', readingHash));

    await redisk.save(new SensorBuffer('test', 'test', readingHash));
    let results = await redisk.list(SensorBuffer);

    let newItem = { name: 'temp', value: '22', unit: 'C', timestamp: '2021-01-01T00:00:00.000Z' }
    const newerItemJSON = JSON.stringify(newItem)

    let newSensorBuffer = insertLatestSensorReading(results[0], JSON.parse(newerItemJSON))
    await redisk.save(newSensorBuffer);
    const buffer = await redisk.getOne(SensorBuffer, 'test');
    expect(JSON.parse(buffer.sensor_readings).temp).toStrictEqual([readingRaw, newItem]);
  })

  it('Should remove oldest item and push newest item onto stack once it hits buffer', async () => {
    // creates fake data
    let items:any[] = [{ id: "also-not-old", name: 'temp', value: '20', unit: 'C', timestamp: new Date().toUTCString() }]

    for(let i = 0; i < 9; i++) {
      let d = new Date()
      d.setMonth(d.getMonth() - 3);
      items.push({ name: 'temp', value: `${faker.datatype.float()}` , unit: 'C', timestamp: d.toUTCString()})
    }
  
    const readingHash = JSON.stringify({'temp': items})
    await redisk.save(new SensorBuffer('test', 'test', readingHash));
    let results = await redisk.list(SensorBuffer);
    expect(JSON.parse(results[0].sensor_readings).temp).toHaveLength(10);
    expect(JSON.parse(results[0].sensor_readings).temp).toStrictEqual(items);

    let newItem ={ id: "good", name: 'temp', value: '22', unit: 'C', timestamp: '2021-01-01T00:00:00.000Z' }
    const newerItemJSON = JSON.stringify(newItem)

    let newSensorBuffer = insertLatestSensorReading(results[0], JSON.parse(newerItemJSON))
    await redisk.save(newSensorBuffer);
    const buffer = await redisk.getOne(SensorBuffer, 'test');
    expect(JSON.parse(results[0].sensor_readings).temp).toHaveLength(10);
    let parsedNewReadings = JSON.parse(buffer.sensor_readings).temp
    expect(parsedNewReadings.find((x:any) => x.id === 'also-not-old')).toBeTruthy();
    expect(parsedNewReadings.find((x:any) => x.id === 'good')).toBeTruthy();
  })

  it('Should remove oldest item and push newest item onto stack once it hits buffer with large buffer', async () => {
    const buffer = 100
    // creates fake data
    let temps:any[] = [{ id: "also-not-old", name: 'temp', value: '20', unit: 'C', timestamp: new Date().toUTCString() }]

    for(let i = 0; i < buffer-1; i++) {
      let d = new Date()
      d.setMonth(d.getMonth() - 3);
      temps.push({ name: 'temp', value: `${faker.datatype.float()}` , unit: 'C', timestamp: d.toUTCString()})
    }

    let humidity = []

    for(let i = 0; i < buffer-1; i++) {
      let d = new Date()
      d.setMonth(d.getMonth() - 3);
      humidity.push({ name: 'humidity', value: `${faker.datatype.float()}` , unit: 'g/m^3', timestamp: d.toUTCString()})
    }
  
    const readingHash = JSON.stringify({'temp': temps, 'humidity': humidity})
    await redisk.save(new SensorBuffer('test', 'test', readingHash));
    let results = await redisk.list(SensorBuffer);
    expect(JSON.parse(results[0].sensor_readings).temp).toHaveLength(buffer);
    expect(JSON.parse(results[0].sensor_readings).temp).toStrictEqual(temps);

    let newItem ={ id: "good", name: 'temp', value: '22', unit: 'C', timestamp: '2021-01-01T00:00:00.000Z' }
    const newerItemJSON = JSON.stringify(newItem)

    let newSensorBuffer = insertLatestSensorReading(results[0], JSON.parse(newerItemJSON))
    await redisk.save(newSensorBuffer);
    const newBuffer = await redisk.getOne(SensorBuffer, 'test');
    expect(JSON.parse(results[0].sensor_readings).temp).toHaveLength(buffer);
    let parsedNewReadings = JSON.parse(newBuffer.sensor_readings).temp
    expect(parsedNewReadings.find((x:any) => x.id === 'also-not-old')).toBeTruthy();
    expect(parsedNewReadings.find((x:any) => x.id === 'good')).toBeTruthy();
  })

  it('Redis client should fail to fetch alert config when doesnt exist', async () => {
    const fakeData = "fake"
    await redis.set(`alerts_config${key}:CustomerDevice`, fakeData)
    let exists = await fetchCustomerDeviceAlertByCustomerId(redis, key)
    expect(exists).toBe(fakeData)
  })
})