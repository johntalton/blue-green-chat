import { Router } from 'express'

// const ws = require('ws')

// const WebSocket = require('ws')
// const { v4: uuidv4 } = require('uuid');
// //const { apiRoute, wsRoute, esRoute } = require('./routes')

// const wss = new WebSocket.Server({ server: httpServer })

// wss.on('connection', function connection(ws, req) {
//   ws.on('message', function incoming(message) {
//     console.log('received: %s', message);
//   });

//   ws.send('{ test: true }');
// });

export function wsRoute() {
  const route = Router()
  return route
}
