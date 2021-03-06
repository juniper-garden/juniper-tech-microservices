import {
  createHashOfDevicesByCustomerDeviceId,
  createHashOfReadingsBySensorName
} from '../utils/data-sanitization'
import { kinesisTransformer } from '../utils/helpers'
import _ from 'lodash/fp'
import moment from 'moment'

export type SensorReading = {
  [key: string]: any;
  customer_device_id: string;
  timestamp: any;
}

export type ReadingsByCustomerId = {
  [key: string]: {
    [key: string]: SensorReading[];
  }
}

// TODO: Refactor
export function processKafkaQueueController(data: any): { readingsMapped: ReadingsByCustomerId, finalBatchResults: SensorReading[] } {
  const processed: any = data.map(kinesisTransformer).flat()
  const readingsMapped: ReadingsByCustomerId = createHashOfDevicesByCustomerDeviceId(processed)

  const finalBatchResults: SensorReading[] = []

  for (const key in readingsMapped) {
    readingsMapped[key] = createHashOfReadingsBySensorName(readingsMapped[key])

    for (const sensorName in readingsMapped[key]) {
      const sensorReadings: SensorReading[] = readingsMapped[key][sensorName]

      sensorReadings.forEach((reding: any) => {
        finalBatchResults.push({
          customer_device_id: key,
          name: sensorName,
          value: parseFloat0(reding.value).toString(),
          unit: sensorReadings[0].unit,
          timestamp: moment.utc(reding.timestamp * 1000).toString()
        })
      })
    }
  }

  return { readingsMapped, finalBatchResults }
}

function parseFloat0(str: string) {
  return Number(parseFloat(str).toFixed(2))
}
