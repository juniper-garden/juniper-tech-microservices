import _ from 'lodash/fp'
import { bulkInsertSensorData } from './bulkInsertSensorData'
import { processKafkaQueueController } from './kafkaSensorRecordProcessor'


const ingestPipe = _.pipe(processKafkaQueueController, bulkInsertSensorData)

export default ingestPipe