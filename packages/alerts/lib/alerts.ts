require('dotenv').config('../.env')
import { EachBatchPayload } from 'kafkajs'
import JuniperCore from '@juniper-tech/core'
import express, { Request, Response } from 'express'

const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const serverAdapter = new ExpressAdapter();

import rulesIngest from './rules/rulesIngest'
import allQueues from './jobs';

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullAdapter(allQueues.allNotificationsQ), new BullAdapter(allQueues.outboundEmailQ)],
  serverAdapter: serverAdapter,
});

const app = express();

serverAdapter.setBasePath('/admin/queues');
app.use('/admin/queues', serverAdapter.getRouter());

const { JuniperKafka, JuniperConsumer, JuniperRedisUtils } = JuniperCore
const { JuniperRedisBuffer } = JuniperRedisUtils

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)
const redisUrl = process.env.REDIS_URI || 'redis://127.0.0.1:6379'

async function setupRedis() {
  const redisObjects:any = await JuniperRedisBuffer(redisUrl)
  global.redisk = redisObjects.redisk
  global.redis = redisObjects.redis
}

setupRedis()

process.once('SIGTERM', async function (code) {
  console.log('SIGTERM received...');
  await global.redisk.close()
  await global.redis.quit()
});


async function alerts() {
  const consumer = await JuniperConsumer(kafka, 'alerts-topic-consumer-1', null)

  await consumer.subscribe({ topic: 'alerts-topic', fromBeginning: true })

  await consumer.run({
    eachBatchAutoResolve: true,
    eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }: EachBatchPayload) => {
      const parsedData = []
      for (const message of batch.messages) {
        if (!isRunning() || isStale()) {
          break
        }

        parsedData.push(JSON.parse(message?.value?.toString() || ''))
        resolveOffset(message.offset)
      }
      await rulesIngest(parsedData)
      await heartbeat()
    }
  }).catch((err: any) => {
    console.error(err)
  })
}

try {
    alerts()
} catch (err) {
    console.error(err)
}

app.get('/', (req: Request, res: Response) => {
  res.status(200)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
})