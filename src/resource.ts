import type { Docker } from './docker'

export abstract class DockerAPIResource {
  protected docker: Docker

  constructor(docker: Docker) {
    this.docker = docker
  }
}
