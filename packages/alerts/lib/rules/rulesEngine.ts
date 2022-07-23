import { Engine } from 'json-rules-engine'
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes'

export default async function runRules(data: RawAlertRuleInputWithParsedSensorHash) {
  /**
   * Setup a new engine
   */
  if(!data.alert_configs || data.alert_configs.length === 0) return
  console.log('made it here')
  let engine = new Engine(data.alert_configs, { allowUndefinedFacts: true })

  // define fact(s) known at runtime
  const facts = buildFactFromReadings(data?.sensor_readings)
  try {
    const ruleResults = await engine.run(facts)
    if (!ruleResults.events.length) return { events: [], facts }
    console.log('events should be fired')
    return { events: ruleResults.events, results: ruleResults.results, facts, device_buffer: data.sensor_readings, customer_device_id: data.customer_device_id }
  } catch (err) {
    console.log(err)
    return { events: [], results: [], facts, device_buffer: data.sensor_readings, customer_device_id: data.customer_device_id }
  }
}

function buildFactFromReadings(data: any) {
  let fact: any = {}
  Object.keys(data).forEach((key: string) => {
    let sum = data[key].reduce((acc: number, curr: any) => {
      return acc + parseFloat(curr.value)
    }, 0)
    // we use the average of the values
    fact[key] = sum / data[key].length
  })
  return fact
}