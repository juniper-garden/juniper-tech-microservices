import { shouldSend } from '../../lib/utils/eventUtils'

describe('Test event utils', () => {
  it('shouldSend should be true if the oldest event is 5 minutes old', () => {
    let events = [
      {
        timestamp: new Date().getTime() - (1 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (2 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (3 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (4 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (5 * 60 * 1000)
      }
    ]

    let bool = shouldSend(events)

    expect(bool).toBe(true)
  })

  it('shouldSend should be false if the oldest event is less than 1 minutes old', () => {
    let events = [
      {
        timestamp: new Date().getTime() - (0.2 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (0.3 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (5 * 60 * 1000)
      }
    ]

    let bool = shouldSend(events)

    expect(bool).toBe(true)
  })

  it('shouldSend should true if some old events are older than threshold', () => {
    let events = [
      {
        timestamp: new Date().getTime() - (0.2 * 60 * 1000)
      },
      {
        timestamp: new Date().getTime() - (0.3 * 60 * 1000)
      }
    ]

    let bool = shouldSend(events)

    expect(bool).toBe(false)
  })
})