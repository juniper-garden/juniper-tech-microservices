import { RawAlertRuleInputWithParsedSensorHash } from "../../lib/customTypes"
import nodeCache from '../cache/nodeCache';

export async function saveLatestEvent(alert: RawAlertRuleInputWithParsedSensorHash, event: any) {
  try {
    if(!Array.isArray(alert.latest_events)) alert.latest_events = []
    alert.latest_events.push(event)
    
    return alert
  } catch (e) {
    return null
  }
}