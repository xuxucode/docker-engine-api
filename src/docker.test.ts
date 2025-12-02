import { describe, expect, it } from 'bun:test'
import { UNIX_SOCKET_CONNECTION_OPTIONS } from './connection'
import { Docker } from './docker'
import { dockerUnixSocketExists } from './utils'

describe.if(dockerUnixSocketExists())('#negotiateAPIVersion', () => {
  it('should negotiate API version', async () => {
    const docker = new Docker(UNIX_SOCKET_CONNECTION_OPTIONS)
    const apiVersion = await docker.negotiateApiVersion()
    expect(apiVersion).toMatch(/^\d[.\w]+$/)
  })
})
