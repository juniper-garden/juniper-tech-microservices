import { findLatestEventsForSensor, saveLatestEvent } from './/sensorBufferUtils';


export function shouldSend(events:any) {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() - 1);
  // sort events by timestamp
  const transformed = events.map((event: any) => {
    return new Date(event.timestamp).getTime()
  })
  const latest = transformed.sort((a:any, b:any) => {
    return b - a;
  })
  let prevDate = latest[0]
  return currentTime.getTime() > prevDate;
}

export async function saveAndExit(buffer: any, done: (params?: any) => void) {
  try {
    await saveLatestEvent(global.redisk, buffer, { event: 'email', timestamp: new Date() })
    return done({ event: 'email', timestamp: new Date() })
  } catch (e) {
    return done(new Error('Error sending push notification'))
  }
}