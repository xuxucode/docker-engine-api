# Docker Engine REST API

https://docs.docker.com/reference/api/engine/

- v1.51:  https://github.com/moby/moby/blob/master/api/docs/v1.51.yaml
- Latest: https://github.com/moby/moby/blob/master/api/swagger.yaml
- Credit: https://github.com/leonitousconforti/the-moby-effect

## Examples

```ts
import { Docker, UNIX_SOCKET_CONNECTION_OPTIONS } from 'docker-engine-api'

async function listContainers() {
  const docker = new Docker(UNIX_SOCKET_CONNECTION_OPTIONS)

  try {
    await docker.negotiateApiVersion() // optional but recommended
    const containerSummaries = await this.docker.containers.list({
      all: true,
      // filters:
    })
  } catch (err) {
    console.error(err)
  }
}
```

## Credits
Huge thanks to [Leo Conforti](https://github.com/leonitousconforti) 👍
