import {
  cleanSensorReadingsAndRemoveOutliers,
  createHashOfDevicesByCustomerDeviceId,
  createHashOfReadingsBySensorName
} from '../utils/data-sanitization'
import { kinesisTransformer } from '../utils/helpers'
import _ from 'lodash/fp'
import moment from 'moment'

export async function processKafkaQueueController(data: any) {
  const processed: any = data.map(kinesisTransformer).flat()
  const readingsMapped = createHashOfDevicesByCustomerDeviceId(processed)

  const finalBatchResults: any[] = []

  for (const key in readingsMapped) {
    readingsMapped[key] = createHashOfReadingsBySensorName(readingsMapped[key])

    for (const sensorName in readingsMapped[key]) {
      const sensorReadings = readingsMapped[key][sensorName]

      sensorReadings.forEach((reding:any) => {
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

  return finalBatchResults
}

function parseFloat0(str: string) {
  return Number(parseFloat(str).toFixed(2))
}
