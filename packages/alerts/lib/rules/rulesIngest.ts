import { TypicalAlertEngineResult } from "../../lib/customTypes"
import _ from "lodash"
import runRules from "./rulesEngine"
import queues from "../../lib/jobs"


export default async function rulesIngest(data:any){
  // group data by id and sort by timestamp then run through rulesEngine
  if(!data.length) {
    return
  }

  let results = await Promise.all(data.map(runRules))

  let allTriggeredAlerts: TypicalAlertEngineResult[] = results.filter(record => record.events.length)
  // common ingress for all event types into the queue
  if (process.env.USE_QUEUES) {
    queues.allNotificationsQ.add(allTriggeredAlerts, {
      attempts: 2,
      removeOnComplete: true
    })
  }

  return allTriggeredAlerts
}