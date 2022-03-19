
export interface KinesisRecordsPayload {
  data: string;
}

export interface IReading {
  customer_device_id: string;
  timestamp: any;
  name: string;
  value: string;
  unit: string;
}

export interface IKinesisSensorPayload {
  id: string,
  timestamp: any,
  readings: SensorReading[];
}

export interface SensorReading {
  name: string;
  value: string;
  unit: string;
}