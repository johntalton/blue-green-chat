import { MessageChannel, MessagePort } from 'worker_threads'
import { URL } from 'url'
import { promises as fs } from 'fs'

import { HttpServices } from './builtin'

type Environment = { web: MessagePort, sse: MessagePort }

type Urn = URL|string
type FsPath = URL|string
type UrlPath = URL|string
// type CodeString = string

type Named = { urn: Urn }
type Active = { active?: boolean }
type NamedActive = Named & Active
type EndpointProtocol = string | 'http' | 'websocket' | 'server-sent-event' | undefined

type Endpoint = NamedActive & { name: UrlPath, protocol: EndpointProtocol }
type Service = NamedActive & { url: FsPath }
// type Script = NamedActive & { src: CodeString }
// type Gatway = NamedActive & { url: UrlPath }
// type Store = NamedActive & { url: FsPath }

type Binding = Active & { to: Urn, from: Urn }

type NamedPort = Required<Named & { port: MessagePort }>

type Configuration = {
  name: string,
  scop: string,
  endpoints: Array<Endpoint>,
  services: Array<Service>,
  bindiners: Array<Binding>
}


// const ENDPOINTS = [
//   { urn: 'urn:message', name: 'message', protocol: 'http' }
// ]

// const SERVICES = [
//   { urn: 'urn:service/message', url: '../private/chat/message' },
//   { urn: 'urn:service/event', url: '../private/chat/event' },
//   { urn: 'urn:service/persist', url: '../private/chat/persist' },
//   { urn: 'urn:service/http', url: '', active: false }
// ]

const BINDINGS = [
  { from: 'urn:message', to: 'urn:service/event' },
  { from: 'endpoint.rest', to: 'persist' },
  { from: 'event.stream', to: 'event' }
]

async function loadEndpoint(env, endpoint: Endpoint, port: MessagePort) {
  console.log('Load Endpoint', endpoint)
  if(endpoint.active === false) { return }

  env.web.postMessage({ type: 'addRoute', name: endpoint.name })
}

async function loadEndpoints(env: Environment, endpoints: Array<Endpoint>): Promise<Array<NamedPort>> {
  return Promise.all(endpoints.map(async endpoint => {
    const channel = new MessageChannel()
    await loadEndpoint(env, endpoint, channel.port1)
    return { urn: endpoint.urn, port: channel.port2 }
  }))
}

async function loadService(service: Service, port: MessagePort) {
  console.log('Load Service', service)

  if(service.active === false) { return }
  try {
    const { handler } = await import(service.url as string)
    await handler(port)
  } catch (e) {
    console.log('failure in loadScript', service, e)
  }
}

async function loadServices(services: Array<Service>): Promise<Array<NamedPort>> {
  return Promise.all(services.map(async service => {
    const channel = new MessageChannel()
    await loadService(service, channel.port1)
    return { urn: service.urn, port: channel.port2 }
  }))
}

async function loadBinding(binding: Binding) {
  console.log('Loading binding', binding)

  if(binding.active === false) { return }

  return undefined
}

async function loadBindings(bindings: Array<Binding>, registry) {
  return Promise.all(bindings.map(async binding => {
    if(binding.active === false) { return binding }
    return loadBinding(binding)
  }))
}

async function configuration(): Promise<Configuration> {
  return JSON.parse(await fs.readFile('./examples/chat.json', { encoding: 'utf-8', flag: 'r' })) as Configuration
}

async function up() {
  const config = await configuration()
  console.log('Bringing up Environment', config)
  const serviceEnv = await HttpServices.setup()

  const registry = await Promise.all([
    await loadEndpoints(serviceEnv, config.endpoints),
    await loadServices(config.services)
  ].reduce((acc, item) => { acc.concat(item); return acc }, []))

  console.log('Binding ...')
  await loadBindings(BINDINGS, registry)
}

up()

/*
channels.endpoint.rest.port2.on('message', msg => {
  // channels.script.message.port2.postMessage({ type: msg.data.type, body: msg.data.body })
  channels.script.event.port2.postMessage({ type: 'broadcast', body: msg.body })
  channels.script.persist.port2.postMessage({ type: 'persist', data: msg.body })
})
channels.endpoint.eventstream.port2.on('message', msg => {
  console.log('proxy message', msg)

  channels.script.event.port2.postMessage({ type: 'connect', port: msg.port }, [msg.port])
})
*/