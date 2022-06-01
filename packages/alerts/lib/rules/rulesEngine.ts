import { Engine } from 'json-rules-engine'
import { HydratedSensorBufferPayload } from '../customTypes'

export default async function runRules(data: HydratedSensorBufferPayload) {
  /**
   * Setup a new engine
   */
  let engine = new Engine()
  data.alert_config.forEach((rule: any) => {
    engine.addRule({...rule})
  })

  // define fact(s) known at runtime
  const facts = buildFactFromReadings(data.device_buffer.sensor_readings)
  const ruleResults = await engine.run(facts)
  if (!ruleResults.events.length) return { events: [], facts }
  return { events: ruleResults.events, results: ruleResults.results, facts, device_buffer: data.device_buffer }
}

function buildFactFromReadings(obj: any) {
  let parsed = JSON.parse(obj)
  let fact: any = {}
  Object.keys(parsed).forEach((key: string) => {
    let sum = parsed[key].reduce((acc: number, curr: any) => {
      return acc + parseFloat(curr.value)
    }, 0)
    // we use the average of the values
    fact[key] = sum / parsed[key].length
  })
  return fact
}