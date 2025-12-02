/**
 * @see https://github.com/moby/moby/blob/master/api/docs/v1.52.yaml#L2802
 * @see https://github.com/moby/moby/blob/453c165be709d294ab744f2efbd2552b338bb1a0/api/types/error_response.go
 */
export interface DockerApiErrorResponse {
  message: string
}

export class DockerApiError extends Error {
  readonly path: string
  readonly status: number
  readonly headers?: Response['headers']

  constructor(path: string, status: number, message: string, headers?: Response['headers']) {
    super(message)

    this.name = this.constructor.name
    this.path = path
    this.status = status
    this.headers = headers
  }
}
