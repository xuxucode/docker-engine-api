/**
 * Http, https, ssh, and unix socket connection agents for all platforms.
 *
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/MobyConnection.ts
 */

import type { MobyConnection } from 'docker-api-types'

/**
 * From
 * https://docs.docker.com/engine/reference/commandline/dockerd/#daemon-socket-option
 * https://docs.docker.com/reference/cli/docker/#host
 *
 * "The Docker client will honor the DOCKER_HOST environment variable to set the
 * -H flag for the client"
 *
 * And then from
 * https://docs.docker.com/engine/reference/commandline/dockerd/#bind-docker-to-another-hostport-or-a-unix-socket
 *
 * "-H accepts host and port assignment in the following format:
 * `tcp://[host]:[port][path]` or `unix://path`
 *
 * For example:
 *
 * - `unix://path/to/socket` -> Unix socket located at path/to/socket.
 *    When -H is empty, it will default to the same value as when no -H was passed in
 * - `http://host:port/path` -> HTTP connection on host:port and prepend path to
 *   all requests
 * - `https://host:port/path` -> HTTPS connection on host:port and prepend path to
 *   all requests
 * - `ssh://me@example.com:22/var/run/docker.sock` -> SSH connection to
 *   example.com on port 22
 *
 * @see https://github.com/leonitousconforti/the-moby-effect/blob/main/src/internal/platforms/connection.ts
 */
export const connectionOptionsFromUrl = (dockerHost: string): MobyConnection.MobyConnectionOptions => {
  const url: URL = new URL(dockerHost)

  if (url.protocol === 'unix:') {
    return { _tag: 'socket', socketPath: url.pathname }
  }

  if (url.protocol === 'ssh:') {
    return {
      _tag: 'ssh',
      host: url.hostname,
      username: url.username,
      password: url.password,
      remoteSocketPath: url.pathname,
      port: url.port ? parseInt(url.port, 10) : 22,
    }
  }

  if (url.protocol === 'http:') {
    return {
      _tag: 'http',
      host: url.hostname ?? '127.0.0.1',
      port: url.port ? parseInt(url.port, 10) : 2375,
      path: url.pathname,
    }
  }

  if (url.protocol === 'https:') {
    return {
      _tag: 'https',
      host: url.hostname ?? '127.0.0.1',
      port: url.port ? parseInt(url.port, 10) : 2376,
      path: url.pathname,
    }
  }

  if (url.protocol === 'tcp:') {
    const path: string = url.pathname
    const host: string = url.hostname ?? '127.0.0.0.1'
    const port: number = url.port ? parseInt(url.port) : 2375
    if (port === 2376) {
      return { _tag: 'https', host, port, path }
    } else {
      return { _tag: 'http', host, port, path }
    }
  }

  // Any other protocols are not supported
  throw new Error(`Unsupported protocol ${url.protocol}`)
}

/**
 * Connection options from the DOCKER_HOST environment variable as a url.
 */
export const ENV_CONNECTION_OPTIONS: MobyConnection.MobyConnectionOptions
  = connectionOptionsFromUrl(process.env.DOCKER_HOST || 'unix:///var/run/docker.sock')

/**
 * Connection options from the platform default system socket location.
 */
export const UNIX_SOCKET_CONNECTION_OPTIONS: Extract<MobyConnection.MobyConnectionOptions, { _tag: 'socket' }>
  = process.platform === 'win32'
    ? { _tag: 'socket', socketPath: '//./pipe/docker_engine' }
    : { _tag: 'socket', socketPath: '/var/run/docker.sock' } // linux, darwin

// /**
//  * Creates a MobyApi layer from the platform default system socket location.
//  */
// export const connectionOptionsFromUserSocketDefault: MobyConnection.MobyConnectionOptions = { socket: { socketPath: path.join(os.homedir(), '.docker', 'run', 'docker.sock') } }
