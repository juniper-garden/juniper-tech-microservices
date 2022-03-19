import { Kafka } from 'kafkajs';
import generateWinstonLogger, { levels } from '../logger/logger';


type Logger = {
  log: (params: LoggerParams) => void
}

type LoggerParams = {
  message: string
  level: levels
}

async function JuniperConsumer(kafka: Kafka, groupId: string, logger: Logger | null) {
  let logHandler:any
  if (!logger) {
    logHandler = generateWinstonLogger(levels.verbose, 'JuniperConsumer') as any;
  } else {
    logHandler = logger
  }

  let consumer = kafka.consumer({
    groupId: groupId || 'nodejs-dev',
    retry: {
      initialRetryTime: 10 * 1000,
      retries: 10
    },
    heartbeatInterval: 10 * 1000
  })

  await consumer.connect()

  consumer.on('consumer.crash', (e: any) => logHandler.log({
    level: levels.error,
    message: 'Consumer Crashed: ' + e.payload?.error
  }))

  consumer.on('consumer.disconnect', (e: any) => logHandler.log({
    level: levels.info,
    message: 'Consumer Disconnected: ' + e.payload?.error
  }))

  consumer.on('consumer.network.request_timeout', (e: any) =>logHandler.log({
    level: levels.warn,
    message: 'Network Timed Out: ' + e.payload?.error
  }))

  return consumer
}



export default JuniperConsumer