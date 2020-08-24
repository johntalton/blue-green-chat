const { promises: fs } = require('fs')
const path = require('path')

const { v4: uuidv4 } = require('uuid')
const JSON_EXT = 'json'
const DOT_JSON_EXT = '.' + JSON_EXT
const WRITE_EXCLUSIVE_FLAG = 'wx'

class FS {
  constructor(base) {
    this.base = base
    this.extention = DOT_JSON_EXT
  }

  uuidToPath(uuid) { return path.resolve(path.join(this.base, uuid + this.extention))}

  async write(uuid, data) {
    const name = this.uuidToPath(uuid)
    await fs.writeFile(name, JSON.stringify(data), { flag: WRITE_EXCLUSIVE_FLAG })
  }

  async read(uuid) {
    const name = this.uuidToPath(uuid)
    return JSON.parse(await fs.readFile(name, { flag: 'r' }))
  }

  async list() {
    const files = await fs.readdir(this.base)
    return files.map(file =>
      path.parse(file).name
    )
  }
}

// Story stores data
class Story {
  static store(urn, url) {
    return Promise.resolve(new Story(urn, url))
  }

  constructor(urn, url) {
    this.urn = urn
    this.backing = new FS(url)
    this.namecache = {}
  }

 async list(from) {
    return this.backing.list()
  }

  async update(key, data) {
    const uuid = uuidv4()
    await this.backing.write(uuid, data)
    this.namecache[key] = uuid
    return uuid
  }

  async read(key) {
    const uuid = (key[0] === '#') ? key.slice(1) : this.namecache[key]
    if(uuid === undefined) return {}
    return this.backing.read(uuid)
  }
}

module.exports = { Story }