### Juniper Tech OS Handlers

These are the handlers that tie into various events inside of the Juniper Tech Ingstion Stack.
These are meant to be small functions that handle specific tasks. Each package requires...

- Dockerfile
- Devspace yml config
- .env file

Each handler needs to accept these env variables:
- topic (the event topic to subscribe to)
- kafka url



## Dependencies
- devspace (`yarn global add devspace`)