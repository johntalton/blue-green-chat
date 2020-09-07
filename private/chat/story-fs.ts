import { promises as fs } from 'fs'
import path from 'path'

const JSON_EXT = 'json'
const DOT_JSON_EXT = '.' + JSON_EXT
const WRITE_EXCLUSIVE_FLAG = 'wx'

export class FS {
  private base: string
  private extention: string

  constructor(base) {
    this.base = base
    this.extention = DOT_JSON_EXT
  }

  uuidToPath(uuid) { return path.resolve(path.join(this.base, uuid + this.extention)) }

  async write(uuid, data) {
    const name = this.uuidToPath(uuid)
    await fs.writeFile(name, JSON.stringify(data), { flag: WRITE_EXCLUSIVE_FLAG })
  }

  async read(uuid) {
    const name = this.uuidToPath(uuid)
    return JSON.parse(await fs.readFile(name, { encoding: 'utf-8', flag: 'r' }))
  }

  async list() {
    const files = await fs.readdir(this.base)
    return files.map(file =>
      path.parse(file).name
    )
  }
}
