import rulesIngest, { sanitizeAlerts } from '../../lib/rules/rulesIngest'
import nodeCache from '../../lib/cache/nodeCache';
import { testData } from '../mocks/testDeviceData'

// const sendAlertRule:any = {
//   conditions: {
//       any: [{
//           all: [{
//               fact: 'temperature',
//               operator: 'greaterThanInclusive',
//               value: 10,
//           }, {
//               fact: 'humidity',
//               operator: 'lessThanInclusive',
//               value: 50,
//           }]
//       }]
//   },
//   event: {
//     type: 'SUCCESS',
//     params: [
//       {
//         type: 'mobilePushNotification'
//       },
//       {
//         type: 'email',
//         data: {
//           email: "daniel.ashcraft@ofashandfire.com"
//         }
//       }
//     ]
//   }
// }

// const nonAlertSendingRule:any = {
//   conditions: {
//       any: [{
//           all: [{
//               fact: 'temperature',
//               operator: 'greaterThanInclusive',
//               value: 100,
//           }, {
//               fact: 'humidity',
//               operator: 'lessThanInclusive',
//               value: 0,
//           }]
//       }]
//   },
//   event: {
//       type: 'pushNotification'
//   }
// }

describe('Tests for rulesIngest function', () => {
  beforeEach(() => {
    //clear nodeCache
    nodeCache.flushAll()
  })
  it('Should fetch data by customerId from id array', async () => {
    const res:any = await rulesIngest([testData[0]])
    expect(res).toHaveLength(1)
    expect(res[0].events[0].type).toBe('SUCCESS')
    expect(res[0].events[0].params).toEqual(testData[0].alert_configs[0].event.params)
    expect(res[0].customer_device_id).toBe(testData[0].customer_device_id)
    expect(res[0].facts.temperature).toBe(24.71)
    expect(res[0].results[0].conditions.priority).toBe(1)
  })

  it('The santization should correctly filter out duplicate events based on timestamp', () => {
    let results = sanitizeAlerts(testData)
    expect(results).toHaveLength(1)
    expect(results[0].latest_event_timestamp).not.toBeUndefined()
  })
})