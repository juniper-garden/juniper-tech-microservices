import { Request, Response } from 'express'
import { Producer } from 'kafkajs'

export async function sensorIngestPoint(req: Request, res: Response) {
  const { body } = req
  const producer: Producer = req.app.get('kafka_producer')
  try {
    await producer.send({
      topic: 'sensor-ingest',
      messages: [
          { key: 'data', value: JSON.stringify(body), partition: 0 }
      ]
    })

    res.status(200).json({
      requestId: body.requestId,
      timestamp:  body.timestamp
    })
  } catch (error) {
    console.log('error', error)
    res.status(500).json({})
  }
}
