import type { MobyEndpoints } from 'docker-api-types'
import { DockerAPIResource } from '../resource'
import { toURLSearchParams } from '../utils'

export type SystemEventsParams = NonNullable<Parameters<MobyEndpoints.System['events']>[0]>

/**
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/endpoints/containers.ts
 */
export class System extends DockerAPIResource {
  /**
   * List containers.
   *
   * Returns a list of containers. For details on the format, see the
   * [inspect endpoint](#operation/ContainerInspect).
   *
   * Note that it uses a different, smaller representation of a container
   * than inspecting a single container. For example, the list of linked
   * containers is not propagated .
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/System/operation/SystemPing
   * @see MobyEndpoints.System.ping
   */
  async ping(): Promise<Response> {
    return await this.docker.fetch(`/_ping`)
  }

  /**
   * Monitor events.
   *
   * Stream real-time events from the server.
   *
   * Various objects within Docker report events when something happens to them.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/System/operation/SystemEvents
   * @see MobyEndpoints.System.events
   */
  async events(params?: SystemEventsParams): Promise<Response> {
    const queryParams = toURLSearchParams(params)
    return await this.docker.fetch(`/events?${queryParams}`)
  }
}
