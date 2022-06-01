import _ from 'lodash/fp'
import { bulkInsertSensorData } from './bulkInsertSensorData'
import { processKafkaQueueController } from './kafkaSensorRecordProcessor'
import sensorBuffer from '../../lib/services/sensorBuffer';

const ingestPipe = _.pipe(processKafkaQueueController, bulkInsertSensorData, sensorBuffer)

export default ingestPipe