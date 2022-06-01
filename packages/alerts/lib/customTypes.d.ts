export type Hash = {
  [key: string]: any;
}

export type Alert = {
  id: string;
  name: string;
  alert_type: AlertType;
  status: AlertStatus;
  json_rule: string;
}

export type HydratedSensorBufferPayload = {
  customer_device_id: string,
  device_buffer: {
    bufferSize: string,
    customer_device_id: string,
    name: string,
    sensor_readings: string,
  },
  alert_config: any
}

export interface JobInterface {
  [key: string]: any
  data: TypicalAlertEngineResult
}

export interface TypicalAlertEngineResult {
  customer_device_id: string;
  events: any[];
  results: any;
  facts: any;
}

export interface JobHandlerParams {
  job: JobInterface,
  done: () => void
}

export type AlertRuleType = 'sms' | 'email' | 'desktopPushNofication' | 'mobilePushNotification';

// Alert type is meant to differentiate priority of alerts
// generic means this is not a critical alert
// in the future this may go away or be incorporated into another model
enum AlertType {
  0 = 'generic'
}

enum AlertStatus {
  0 = 'active',
  1 = 'archived',
  2 = 'removed'
}

declare global {
  var redis: any;
  var redisk: any;
}