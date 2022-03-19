import JuniperKafka from './kafka/kafka'
import JuniperConsumer from './kafka/consumer';
import SensorModel from './db/sensor-reading';

const commonExport =  {
    JuniperKafka,
    JuniperConsumer,
    SensorModel
}

export default commonExport