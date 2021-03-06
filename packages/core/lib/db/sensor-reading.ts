import { DataTypes, Model, Sequelize } from 'sequelize'
import withDateNoTz from 'sequelize-date-no-tz-postgres'

// We export a function that defines the model.
// This function will automatically receive as parameter the Sequelize connection object.

class SensorReading extends Model<any> {}
const customerDataTypes = withDateNoTz(DataTypes)

function SensorModel (sequelize: Sequelize) {
  return SensorReading.init({
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customer_device_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    timestamp: {
      type: customerDataTypes.DATE_NO_TZ,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    },
    value: {
      type: DataTypes.STRING
    },
    unit: {
      type: DataTypes.STRING
    }
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'SensorReading',
    tableName: 'sensor_readings', // We need to choose the model name
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  })
}


export default SensorModel
