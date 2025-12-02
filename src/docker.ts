import type { MobyConnection } from 'docker-api-types'
import { DockerApiError, type DockerApiErrorResponse } from './error'
import { Containers } from './resources/containers'
import { Execs } from './resources/execs'
import { System } from './resources/system'

/**
 * Hostname used for local communication.
 *
 * It acts as a valid formatted hostname for local connections (such as "unix://"
 * or "npipe://") which do not require a hostname. It should never be resolved,
 * but uses the special-purpose ".localhost" TLD (as defined in [RFC 2606, Section 2]
 * and [RFC 6761, Section 6.3]).
 *
 * [RFC 2606, Section 2]: https://www.rfc-editor.org/rfc/rfc2606.html#section-2
 * [RFC 6761, Section 6.3]: https://www.rfc-editor.org/rfc/rfc6761#section-6.3
 *
 * @see https://github.com/moby/moby/blob/v28.3.3/client/client.go#L92
 */
const DUMMY_HOST = 'api.moby.localhost'

/**
 * Default Docket Engine API version
 *
 * If API-version negotiation is enabled (see {@link Docker.negotiateApiVersion}),
 * the client may downgrade its API version.
 */
const DEFAULT_API_VERSION = '1.48'

export class Docker {
  version: string
  host?: string
  port?: number
  baseUrl: string
  fetchOptions: BunFetchRequestInit

  // Resources.
  containers: Containers
  execs: Execs
  system: System

  constructor(options: MobyConnection.MobyConnectionOptions) {
    this.version = options.version || DEFAULT_API_VERSION
    this.baseUrl = getRequestBaseUrl(options, this.version)
    this.fetchOptions = getFetchOptions(options)

    if (options._tag === 'http' || options._tag === 'https') {
      this.host = options.host
      this.port = options.port
    }

    // Add resources.
    this.containers = new Containers(this)
    this.execs = new Execs(this)
    this.system = new System(this)
  }

  /**
   * Query the API and update the version to match the API version from the
   * ping response.
   *
   * @see https://github.com/moby/moby/blob/v28.3.3/client/client.go#L283
   */
  async negotiateApiVersion(): Promise<string | undefined> {
    try {
      const response = await this.system.ping()
      const serverVersion = response.headers.get('Api-Version')
      if (serverVersion && this.version) {
        const serverVersionNumber = parseFloat(serverVersion)
        const clientVersionNumber = parseFloat(this.version)
        if (serverVersionNumber < clientVersionNumber) {
          // If server version is lower than the client version, downgrade.
          console.error('[docker] server API version is less than the client API version')
          this.version = serverVersion
          return serverVersion
        } else {
          return this.version
        }
      }
    } catch (err) {
      console.error('[docker] failed to negotiate API version:', err)
    }
  }

  async fetch(path: string, init?: BunFetchRequestInit): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...this.fetchOptions,
      ...init,
    })

    // Throw a DockerAPIError if the response is not successful.
    if (!response.ok) {
      // Some responses, for example status 304, do not contain a body.
      const hasJson = response.headers.get('content-type')?.startsWith('application/json')

      let errorResponse: DockerApiErrorResponse
      try {
        errorResponse = hasJson
          ? await response.json() as DockerApiErrorResponse
          : { message: await response.text() || '[no error message]' }
      } catch {
        errorResponse = { message: `error from ${path}` }
      }
      throw new DockerApiError(path, response.status, errorResponse.message, response.headers)
    }

    // Return a successful response.
    return response
  }
}

/**
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/platforms/agnostic.ts#L21
 */
function getRequestBaseUrl(options: MobyConnection.MobyConnectionOptions, clientVersion?: string): string {
  const version = clientVersion ? `/v${clientVersion}` : ''
  switch (options._tag) {
    case 'ssh':
      return `http://0.0.0.0${version}`
    case 'socket':
      return `http://${DUMMY_HOST}${version}`
    case 'http':
      return `http://${options.host}:${options.port}${options.path ?? ''}${version}`
    case 'https':
      return `https://${options.host}:${options.port}${options.path ?? ''}${version}`
  }
}

/**
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/platforms/node.ts#L111
 */
function getFetchOptions(options: MobyConnection.MobyConnectionOptions): BunFetchRequestInit {
  switch (options._tag) {
    case 'socket':
      return {
        unix: options.socketPath,
      }
    case 'https':
      return {
        tls: {
          ca: options.ca,
          key: options.key,
          cert: options.cert,
          passphrase: options.passphrase,
        },
      }
    // case 'ssh': return SSH agent
    default:
      return {}
  }
}
