import type { MobyEndpoints, MobySchemas } from 'docker-api-types'
import type { Effect } from 'docker-api-types/effect'
import { DockerAPIResource } from '../resource'
import { toURLSearchParams } from '../utils'

// https://github.com/moby/moby/blob/master/api/docs/v1.51.yaml

// type ContainerListParams = Parameters<typeof MobyEndpoints.Containers.Service.list>[0]

export type ContainerListParams = NonNullable<Parameters<MobyEndpoints.Containers['list']>[0]>
export type ContainerCreateParams = NonNullable<Parameters<MobyEndpoints.Containers['create']>[0]>
export type ContainerCreateResponse = Effect.Effect.Success<ReturnType<MobyEndpoints.Containers['create']>>
export type ContainerInspectParams = NonNullable<Parameters<MobyEndpoints.Containers['inspect']>[1]>
export type ContainerTopParams = NonNullable<Parameters<MobyEndpoints.Containers['top']>[1]>
export type ContainerLogsParams = NonNullable<Parameters<MobyEndpoints.Containers['logs']>[1]>
export type ContainerStatsParams = NonNullable<Parameters<MobyEndpoints.Containers['stats']>[1]>
export type ContainerResizeParams = NonNullable<Parameters<MobyEndpoints.Containers['resize']>[1]>
export type ContainerStartParams = NonNullable<Parameters<MobyEndpoints.Containers['start']>[1]>
export type ContainerStopParams = NonNullable<Parameters<MobyEndpoints.Containers['stop']>[1]>
export type ContainerRestartParams = NonNullable<Parameters<MobyEndpoints.Containers['restart']>[1]>
export type ContainerKillParams = NonNullable<Parameters<MobyEndpoints.Containers['kill']>[1]>
export type ContainerUpdateParams = NonNullable<Parameters<MobyEndpoints.Containers['update']>[1]>
export type ContainerUpdateResponse = Effect.Effect.Success<ReturnType<MobyEndpoints.Containers['update']>>
export type ContainerRenameParams = NonNullable<Parameters<MobyEndpoints.Containers['rename']>[1]>
export type ContainerAttachParams = NonNullable<Parameters<MobyEndpoints.Containers['attach']>[1]>
export type ContainerWaitParams = NonNullable<Parameters<MobyEndpoints.Containers['wait']>[1]>
export type ContainerDeleteParams = NonNullable<Parameters<MobyEndpoints.Containers['delete']>[1]>
export type ContainerArchiveParams = NonNullable<Parameters<MobyEndpoints.Containers['archive']>[1]>
export type ContainerArchiveInfoParams = NonNullable<Parameters<MobyEndpoints.Containers['archiveInfo']>[1]>
export type ContainerPutArchiveParams = NonNullable<Parameters<MobyEndpoints.Containers['putArchive']>[1]> & { stream: Bun.BodyInit }
export type ContainerPruneParams = NonNullable<Parameters<MobyEndpoints.Containers['prune']>[0]>
export type ContainerPruneResponse = Effect.Effect.Success<ReturnType<MobyEndpoints.Containers['prune']>>

/**
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/endpoints/containers.ts
 */
export class Containers extends DockerAPIResource {
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
   * @see https://docs.docker.com/reference/api/engine/latest/#tag/Container/operation/ContainerList
   * @see MobyEndpoints.Containers.list
   *
   * // TODO: https://github.com/leonitousconforti/the-moby-effect/issues/287
   */
  async list(params?: ContainerListParams): Promise<MobySchemas.ContainerSummary[]> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/json?${queryParams}`)
    return await response.json() as MobySchemas.ContainerSummary[]
  }

  /**
   * Create a container.
   *
   * @see https://docs.docker.com/reference/api/engine/latest/#tag/Container/operation/ContainerCreate
   * @see MobyEndpoints.Containers.create
   */
  async create(params: ContainerCreateParams): Promise<ContainerCreateResponse> {
    const { Name: name, Platform: platform, ...body } = params
    const queryParams = toURLSearchParams({ name, platform })
    const response = await this.docker.fetch(`/containers/create?${queryParams}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return await response.json() as ContainerCreateResponse
  }

  /**
   * Inspect a container.
   *
   * Return low-level information about a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerInspect
   * @see MobyEndpoints.Containers.inspect
   */
  async inspect(id: string, params?: ContainerInspectParams): Promise<MobySchemas.ContainerInspectResponse> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/${id}/json?${queryParams}`)
    return await response.json() as MobySchemas.ContainerInspectResponse
  }

  /**
   * List processes running inside a container.
   *
   * On Unix systems, this is done by running the ps command. This endpoint is not supported on Windows.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerTop
   * @see MobyEndpoints.Containers.top
   */
  async top(id: string, params?: ContainerTopParams): Promise<MobySchemas.ContainerTopResponse> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/${id}/top?${queryParams}`)
    return await response.json() as MobySchemas.ContainerTopResponse
  }

  /**
   * Get container logs.
   *
   * Get `stdout` and `stderr` logs from a container.
   * Note: This endpoint works only for containers with the `json-file` or `journald` logging driver.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerLogs
   * @see MobyEndpoints.Containers.logs
   */
  async logs(id: string, params?: ContainerLogsParams, options?: BunFetchRequestInit): Promise<Response> {
    const queryParams = toURLSearchParams(params)
    return await this.docker.fetch(`/containers/${id}/logs?${queryParams}`, options)
  }

  /**
   * Get changes on a container’s filesystem.
   *
   * Returns which files in a container's filesystem have been added, deleted,
   * or modified. The `Kind` of modification can be one of:
   * - `0`: Modified ("C")
   * - `1`: Added ("A")
   * - `2`: Deleted ("D")
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerChanges
   * @see MobyEndpoints.Containers.changes
   */
  async changes(id: string): Promise<MobySchemas.ArchiveChange[]> {
    const response = await this.docker.fetch(`/containers/${id}/changes`)
    return await response.json() as MobySchemas.ArchiveChange[]
  }

  /**
   * Export a container.
   *
   * Export the contents of a container as a tarball.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerExport
   * @see MobyEndpoints.Containers.export
   */
  async export(id: string): Promise<Response> {
    return await this.docker.fetch(`/containers/${id}/export`)
  }

  /**
   * Get container stats based on resource usage.
   *
   * This endpoint returns a live stream of a container’s resource usage statistics.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStats
   * @see MobyEndpoints.Containers.stats
   */
  async stats(id: string, params?: ContainerStatsParams): Promise<Response> {
    const queryParams = toURLSearchParams(params)
    return await this.docker.fetch(`/containers/${id}/stats?${queryParams}`)
    // FIXME: ReadableStream<>
  }

  /**
   * Resize a container TTY.
   *
   * Resize the TTY for a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerResize
   * @see MobyEndpoints.Containers.resize
   */
  async resize(id: string, params?: ContainerResizeParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/resize?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Start a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStart
   * @see MobyEndpoints.Containers.start
   */
  async start(id: string, params?: ContainerStartParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/start?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Stop a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerStop
   * @see MobyEndpoints.Containers.stop
   */
  async stop(id: string, params?: ContainerStopParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/stop?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Restart a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRestart
   * @see MobyEndpoints.Containers.restart
   */
  async restart(id: string, params: ContainerRestartParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/restart?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Kill a container.
   *
   * Send a POSIX signal to a container, defaulting to killing to the container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerKill
   * @see MobyEndpoints.Containers.kill
   */
  async kill(id: string, params?: ContainerKillParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/kill?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Update a container.
   *
   * Change various configuration options of a container without having to recreate it.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUpdate
   * @see MobyEndpoints.Containers.update
   */
  async update(id: string, params: ContainerUpdateParams): Promise<ContainerUpdateResponse> {
    const response = await this.docker.fetch(`/containers/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return await response.json() as ContainerUpdateResponse
  }

  /**
   * Rename a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerRename
   * @see MobyEndpoints.Containers.rename
   */
  async rename(id: string, name: string): Promise<void> {
    const queryParams = toURLSearchParams({ name })
    await this.docker.fetch(`/containers/${id}/rename?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Pause a container.
   *
   * Use the freezer cgroup to suspend all processes in a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPause
   * @see MobyEndpoints.Containers.pause
   */
  async pause(id: string): Promise<void> {
    await this.docker.fetch(`/containers/${id}/pause`, {
      method: 'POST',
    })
  }

  /**
   * Unpause a container.
   *
   * Resume a container which has been paused.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerUnpause
   * @see MobyEndpoints.Containers.unpause
   */
  async unpause(id: string): Promise<void> {
    await this.docker.fetch(`/containers/${id}/unpause`, {
      method: 'POST',
    })
  }

  /**
   * Attach to a container.
   *
   * Attach to a container to read its output or send it input. You can attach
   * to the same container multiple times and you can reattach to containers
   * that have been detached.
   *
   * Either the `stream` or `logs` parameter must be `true` for this endpoint
   * to do anything.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerAttach
   * @see MobyEndpoints.Containers.attach
   */
  async attach(id: string, params?: ContainerAttachParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/${id}/attach?${queryParams}`, {
      method: 'POST',
      headers: {
        Upgrade: 'tcp',
        Connection: 'Upgrade',
      },
    })
    // FIXME: return socket
  }

  /**
   * Attach to a container via a websocket.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerAttachWebsocket
   * @see MobyEndpoints.Containers.attachWebsocket
   */
  async attachWebsocket(id: string, params?: ContainerAttachParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/${id}/attach/ws?${queryParams}`, {
      method: 'POST',
    })
    // FIXME: return socket
  }

  /**
   * Wait for a container.
   *
   * Block until a container stops, then returns the exit code.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerWait
   * @see MobyEndpoints.Containers.wait
   */
  async wait(id: string, params?: ContainerWaitParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/wait?${queryParams}`, {
      method: 'POST',
    })
  }

  /**
   * Remove a container.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerDelete
   * @see MobyEndpoints.Containers.delete
   */
  async delete(id: string, params?: ContainerDeleteParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}?${queryParams}`, {
      method: 'DELETE',
    })
  }

  /**
   * Get an archive of a filesystem resource in a container.
   *
   * Get a tar archive of a resource in the filesystem of container id.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchive
   * @see MobyEndpoints.Containers.archive
   */
  async archive(id: string, params: ContainerArchiveParams): Promise<void> {
    const queryParams = toURLSearchParams(params)
    await this.docker.fetch(`/containers/${id}/archive?${queryParams}`)

    // FIXME: return stream
  }

  /**
   * Get information about files in a container.
   *
   * A response header `X-Docker-Container-Path-Stat` is returned, containing
   * a base64 - encoded JSON object with some filesystem header information
   * about the path.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerArchiveInfo
   * @see MobyEndpoints.Containers.archiveInfo
   */
  async archiveInfo(id: string, params: ContainerArchiveInfoParams): Promise<MobySchemas.ContainerPathStat | undefined> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/${id}/archive?${queryParams}`, {
      method: 'HEAD',
    })
    const info = response.headers.get('X-Docker-Container-Path-Stat')
    if (info) {
      try {
        return JSON.parse(atob(info)) as MobySchemas.ContainerPathStat
      } catch {
        // ignore error
      }
    }
  }

  /**
   * Extract an archive of files or folders to a directory in a container.
   *
   * Upload a tar archive to be extracted to a path in the filesystem of
   * container id. `path` parameter is asserted to be a directory. If it exists
   * as a file, 400 error will be returned with message "not a directory".
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/PutContainerArchive
   * @see MobyEndpoints.Containers.putArchive
   */
  async putArchive(id: string, params: ContainerPutArchiveParams): Promise<void> {
    const { stream, ...query } = params
    const queryParams = toURLSearchParams(query)
    await this.docker.fetch(`/containers/${id}/archive?${queryParams}`, {
      method: 'PUT',
      body: stream,
    })
  }

  /**
   * Delete stopped containers.
   *
   * @see https://docs.docker.com/reference/api/engine/version/v1.51/#tag/Container/operation/ContainerPrune
   * @see MobyEndpoints.Containers.prune
   *
   * // TODO: https://github.com/leonitousconforti/the-moby-effect/issues/287
   */
  async prune(params: ContainerPruneParams): Promise<ContainerPruneResponse> {
    const queryParams = toURLSearchParams(params)
    const response = await this.docker.fetch(`/containers/prune?${queryParams}`, {
      method: 'POST',
    })
    return await response.json() as ContainerPruneResponse
  }
}
