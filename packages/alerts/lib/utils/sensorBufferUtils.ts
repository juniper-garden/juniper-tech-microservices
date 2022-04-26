export function findLatestEventsForSensor(sensorBuffer: any) {
  try {
    const latestEvents = JSON.parse(sensorBuffer.latest_events)
    if(!latestEvents.length) return null

    return latestEvents
  } catch (e) {
    return null
  }
}

export async function saveLatestEvent(redisk: any, sensorBuffer: any, event: any) {
  try {
    let latestEvents = JSON.parse(sensorBuffer.latest_events) || []
    if(!Array.isArray(latestEvents)) latestEvents = []
    latestEvents.push(event)
    sensorBuffer.latest_events = JSON.stringify(latestEvents)
    await redisk.save(sensorBuffer)
    return sensorBuffer
  } catch (e) {
    return null
  }
}