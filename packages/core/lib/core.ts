import JuniperKafka from './kafka/kafka'
import JuniperConsumer from './kafka/consumer';
import SensorModel from './db/sensor-reading';
import JuniperRedisUtils from './redis/juniperRedisUtils'
const commonExport =  {
    JuniperKafka,
    JuniperConsumer,
    SensorModel,
    JuniperRedisUtils
}

export default commonExport