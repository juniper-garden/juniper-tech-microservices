import _ from "lodash";
import moment from 'moment'
import { saveAndExit, saveAndExitNoEvent, shouldSend } from '../utils/eventUtils';
import { RawAlertRuleInputWithParsedSensorHash } from '../../lib/customTypes';
import nodeCache from '../cache/nodeCache';
import { sendNotification } from "../utils/emailUtils";


export default async function email(job: RawAlertRuleInputWithParsedSensorHash[], done:  (params?:any) => void) {
    const [data] = job
    // fetch sensor from node cache
    try {
    const send = shouldSend(data)
    if(!send) return done('No new events')
    const sent:any = await sendNotification(data)

    const latest_event = { type: 'email' }
    if(sent) return saveAndExit(data, latest_event, done)
    return saveAndExitNoEvent(data, latest_event, done)
  } catch(err) {
    return done(new Error('Error sending push notification'))
  }
}