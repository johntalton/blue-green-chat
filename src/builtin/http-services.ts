// import http from 'http'
import https from 'https'
import { promises as fs } from 'fs'
import { MessageChannel } from 'worker_threads'

import { EndpointService } from '../endpoint'


export class HttpServices {
  static async setup() {
    const creds = await HttpServices.fsCreds()

    const web = new MessageChannel()
    const sse = new MessageChannel()

    const eproute = EndpointService.endpoint(web.port1, sse.port1)

    const httpServer = https.createServer(creds, eproute)
    httpServer.listen(443)

    return {
      web: web.port2,
      sse: sse.port2
    }
  }

  static async fsCreds() {
    const key = await fs.readFile('ssl/key.pem', 'utf-8')
    const cert = await fs.readFile('ssl/cert.pem', 'utf-8')
    return { key, cert }
  }
}
