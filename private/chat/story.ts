import { v4 as uuidv4 } from 'uuid'

import { FS } from './story-fs'

// Story stores data
export class Story {
  private backing
  private namecache

  static store(urn, url) {
    return Promise.resolve(new Story(urn, url))
  }

  constructor(urn, url) {
    this.backing = new FS(url)
    this.namecache = {}
  }

  async list() {
    return this.backing.list()
  }

  async update(key, data) {
    const uuid = uuidv4()
    await this.backing.write(uuid, data)
    this.namecache[key] = uuid
    return uuid
  }

  async read(key) {
    const uuid = key[0] === '#' ? key.slice(1) : this.namecache[key]
    if(uuid === undefined) { return {} }
    return this.backing.read(uuid)
  }
}
