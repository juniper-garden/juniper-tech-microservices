import { Entity, Primary, Property, Redisk, Unique } from "redisk";
import { createClient } from 'redis';

type SensorReading = {
  name: string;
  value: any;
  unit: any;
  timestamp: any;
}



export async function JuniperRedisBuffer(redis_url: string) {
  let options = {}
  if(redis_url.includes('rediss')) {
    options = {
      socket: {
        tls: true
      }
    } 
  }
  const client = createClient({ url: redis_url, ...options });

  client.on('error', (err) => console.log('Redis Client Error', err));

  await client.connect();
  
  return {
    redisk: Redisk.init({ url: redis_url , ...options}),
    redis: client
  }
}

@Entity('sensor_buffer')
export class SensorBuffer {
  @Primary()
  @Unique()
  @Property({indexed: true})
  public readonly customer_device_id: string;

  @Property()
  public name: string;

  @Property()
  public bufferSize: number;

  @Property()
  public sensor_readings: string;

  @Property()
  public latest_events: string;

  constructor(
      customer_device_id: string,
      name: string,
      sensor_readings: string,
      bufferSize: number = 10,
      latest_events: string = '{}'
    ) {
      this.customer_device_id = customer_device_id;
      this.name = name;
      this.sensor_readings = sensor_readings;
      this.bufferSize = bufferSize;
      this.latest_events = latest_events;
  }
}

export function insertLatestSensorReading(item: SensorBuffer, reading: SensorReading): any {
  // set reading name to var that's easier to read
  let sensorName = reading.name;

  // parse hash from item.sensor_readings
  let sensorReadingsHash = JSON.parse(item.sensor_readings)

  // check if hash for sensor name exists
  if (!sensorReadingsHash[sensorName]) {
    sensorReadingsHash[sensorName] = []
  }

  // get readings for sensor name
  let sensorReadings = sensorReadingsHash[sensorName]

  // check if we've met buffer size to start dropping items
  if(sensorReadings.length < item.bufferSize) {
    sensorReadings.push(reading)
    sensorReadingsHash[sensorName] = sensorReadings
    item.sensor_readings = JSON.stringify(sensorReadingsHash)
    return item
  }

  // sort from oldest to newest
  let sorted = sensorReadings.sort((a: SensorReading, b: SensorReading) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  // remove first item from sorted
  sorted.shift()

  // push new item onto end of sorted
  sorted.push(reading)
  sensorReadingsHash[sensorName] = sorted
  item.sensor_readings = JSON.stringify(sensorReadingsHash)  
  return item
}

export async function fetchCustomerDeviceAlertByCustomerId(redisClient:any, customer_device_id: string) {
  let keyPattern =  `alerts_config:alerts_config${customer_device_id}:CustomerDevice*`
  let keys = await redisClient.keys(keyPattern)
  return await redisClient.MGET(keys)
}

const JuniperRedisUtils: any = {
  fetchCustomerDeviceAlertByCustomerId,
  insertLatestSensorReading,
  SensorBuffer,
  JuniperRedisBuffer
}

export default JuniperRedisUtils