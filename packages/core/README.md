# `@juniper-tech/core`

## Usage
... work in progress
### Kafka Topic Consumption
We use kafkajs in the core library to generate and process messages in topics.

```
import { JuniperKafka, JuniperConsumer } from '@juniper-tech/core'

const kafka = JuniperKafka(process.env.KAFKA_BROKERS || '', 'juniper-ingest-client', 2)

const consumer = await JuniperConsumer(kafka, 'nodejs-dev', null)

```


### Sensor Model Interaction
We use sequelize to interact with tables and have conveniently abstracted out
the model creation so you can import into your own package.

```
// Sequelize connection is the sequelize instance of your db
import SequelizeConnection from '../sequelize-connection'
import { SensorModel } from '@juniper-tech/core'


let sensorPg = SensorModel(DB)

// this is now a standard sequelize model and can be used like one
sensorPg.bulkCreate(data as any).catch((err:any) => {
  console.error('error', err)
})
```