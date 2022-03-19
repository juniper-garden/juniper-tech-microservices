import { Kafka, logLevel as KafkaLogLevel } from 'kafkajs'

function JuniperKafka(brokers: string, clientId: string, logLevel: KafkaLogLevel) {
  let kafka:any = {}
  // Create the client with the broker list
  kafka = new Kafka({
    brokers:  brokers.split(','),
    logLevel: logLevel,
    clientId: clientId || 'juniper-ingest-client'
  })

  return kafka
}

export default JuniperKafka
