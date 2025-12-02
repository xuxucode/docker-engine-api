import type { MobyEndpoints, MobySchemas } from 'docker-api-types'
import type { Effect } from 'docker-api-types/effect'
import { DockerAPIResource } from '../resource'
import { toURLSearchParams } from '../utils'

// The id of the newly created object.
export type IDResponse = Effect.Effect.Success<ReturnType<MobyEndpoints.Execs['container']>>

export type ExecsContainerParams = NonNullable<Parameters<MobyEndpoints.Execs['container']>[1]>
export type ExecsStartParams = NonNullable<Parameters<MobyEndpoints.Execs['start']>[1]>
export type ExecsResizeParams = NonNullable<Parameters<MobyEndpoints.Execs['resize']>[1]>
export type ExecsInspectParams = NonNullable<Parameters<MobyEndpoints.Execs['inspect']>[0]>

/**
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/endpoints/containers.ts
 *
 * Run new commands inside running containers. Refer to the command-line
 * reference for more information.
 *
 * To exec a command in a container, you first need to create an exec instance,
 * then start it. These two API endpoints are wrapped up in a single command-line
 * command `docker exec`.
 */
export class Execs extends DockerAPIResource {
  /**
   * Create an exec instance.
   *
   * Run a command inside a running container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ContainerExec
   * @see MobyEndpoints.Execs.container
   */
  async container(id: string, params: ExecsContainerParams): Promise<IDResponse> {
    const response = await this.docker.fetch(`/containers/${id}/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return await response.json() as IDResponse
  }

  /**
   * Start an exec instance.
   *
   * Starts a previously set up exec instance. If detach is true, this endpoint
   * returns immediately after starting the command. Otherwise, it sets up an
   * interactive session with the command.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecStart
   * @see MobyEndpoints.Execs.start
   */
  async start(id: string, params: ExecsStartParams): Promise<Response> {
    return await this.docker.fetch(`/exec/${id}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
  }

  /**
   * Resize an exec instance.
   *
   * Resize the TTY session used by an exec instance. This endpoint only works
   * if `tty` was specified as part of creating and starting the exec instance.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecResize
   * @see MobyEndpoints.Execs.resize
   */
  async resize(id: string, params: ExecsResizeParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/exec/${id}/resize?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Inspect an exec instance.
   *
   * Return low-level information about an exec instance.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Exec/operation/ExecInspect
   * @see MobyEndpoints.Execs.inspect
   */
  async inspect(id: string): Promise<MobySchemas.ContainerExecInspect> {
    const response = await this.docker.fetch(`/exec/${id}/json`)
    return await response.json() as MobySchemas.ContainerExecInspect
  }
}
