import { existsSync } from 'node:fs'

export function toURLSearchParams(obj?: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams()
  if (!obj) return params

  for (const [key, value] of Object.entries(obj)) {
    if (value != null) {
      params.append(key, value && typeof value === 'object' ? JSON.stringify(value) : String(value))
    }
  }
  return params
}


// Note: Bun.file() currently only works with regular files, i.e. not link, directory, socket file
// https://github.com/oven-sh/bun/issues/21537
export const dockerUnixSocketExists = () => existsSync(
  process.platform === 'win32'
    ? '//./pipe/docker_engine'
    : '/var/run/docker.sock',
)
