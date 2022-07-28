import { RawAlertRuleInputWithParsedSensorHash } from "../../lib/customTypes";

export const testData: RawAlertRuleInputWithParsedSensorHash[] = [
  {
    "customer_device_id": "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    "sensor_readings": {
      "temperature": [
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        },
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        }
      ]
    },
    "alert_configs": [
      {
        "conditions": {
          "any": [
            {
              "any": [
                {
                  "fact": "temperature",
                  "operator": "greaterThan",
                  "value": "1"
                },
                {
                  "fact": "temperature",
                  "operator": "lessThan",
                  "value": "0"
                }
              ]
            }
          ]
        },
        "event": {
          "type": "SUCCESS",
          "params": [
            {
              "type": "email",
              "data": {
                "email": "daniel.ashcraft@ofashandfire.com"
              }
            }
          ]
        }
      }
    ],
    "latest_events": null,
    "latest_event_timestamp": null
  },
  {
    "customer_device_id": "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    "sensor_readings": {
      "temperature": [
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        },
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        }
      ]
    },
    "alert_configs": [
      {
        "conditions": {
          "any": [
            {
              "any": [
                {
                  "fact": "temperature",
                  "operator": "greaterThan",
                  "value": "1"
                },
                {
                  "fact": "temperature",
                  "operator": "lessThan",
                  "value": "0"
                }
              ]
            }
          ]
        },
        "event": {
          "type": "SUCCESS",
          "params": [
            {
              "type": "email",
              "data": {
                "email": "daniel.ashcraft@ofashandfire.com"
              }
            }
          ]
        }
      }
    ],
    "latest_events": null,
    "latest_event_timestamp": null
  },
  {
    "customer_device_id": "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    "sensor_readings": {
      "temperature": [
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        },
        {
          "value": 24.71,
          "unit": "C",
          "timestamp": 1659018456
        }
      ]
    },
    "alert_configs": [
      {
        "conditions": {
          "any": [
            {
              "any": [
                {
                  "fact": "temperature",
                  "operator": "greaterThan",
                  "value": "1"
                },
                {
                  "fact": "temperature",
                  "operator": "lessThan",
                  "value": "0"
                }
              ]
            }
          ]
        },
        "event": {
          "type": "SUCCESS",
          "params": [
            {
              "type": "email",
              "data": {
                "email": "daniel.ashcraft@ofashandfire.com"
              }
            }
          ]
        }
      }
    ],
    "latest_events": null,
    "latest_event_timestamp": null
  },
  {
    "customer_device_id": "81eaec8b-cc5a-4fe1-811c-d996d4bfe0ad",
    "sensor_readings": {
      "absolute_humidity": [
        {
          "value": 9.117157,
          "unit": "g/m^3",
          "timestamp": 1659018457
        },
        {
          "value": 9.117157,
          "unit": "g/m^3",
          "timestamp": 1659018457
        }
      ]
    },
    "alert_configs": [
      {
        "conditions": {
          "any": [
            {
              "any": [
                {
                  "fact": "temperature",
                  "operator": "greaterThan",
                  "value": "1"
                },
                {
                  "fact": "temperature",
                  "operator": "lessThan",
                  "value": "0"
                }
              ]
            }
          ]
        },
        "event": {
          "type": "SUCCESS",
          "params": [
            {
              "type": "email",
              "data": {
                "email": "daniel.ashcraft@ofashandfire.com"
              }
            }
          ]
        }
      }
    ],
    "latest_events": null,
    "latest_event_timestamp": null
  }
]