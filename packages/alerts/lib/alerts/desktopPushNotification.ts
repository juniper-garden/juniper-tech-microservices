import { RawAlertRuleInputWithParsedSensorHash } from "../../lib/customTypes";
import _ from "lodash";
import { shouldSend, saveAndExit } from '../utils/eventUtils';

export default async function desktopPushNotifiation(job: RawAlertRuleInputWithParsedSensorHash[], done:  (params?:any) => void) {
  const [data]: any = job;
  // instantiate an empty buffer for sensor name
  if(!data.latest_events || data.latest_events.length == 0) {
    const sent:any = await sendNotification(data)
    const latest_event = { event: 'desktopPushNotification' }
    if(sent) return saveAndExit(data, latest_event, done)
    done(new Error('Error sending push notification'))
  }
  
  if(data.latest_events && shouldSend(data.latest_events)) {
    console.log('should_send')
    const sent:any = await sendNotification(data)
    const latest_event = { event: 'desktopPushNotification' }
    if(sent) return saveAndExit(data, latest_event, done)
    done(new Error('Error sending push notification'))
  }
}

function sendNotification(data: any) {
  return Promise.resolve(true)
}