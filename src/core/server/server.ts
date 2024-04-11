import http from 'node:http'
import { WebSocketServer } from 'ws'

import { Clients } from '../../shared/types/types.js'
import { Client } from './client.js'
import { getRequestsWithRouterForServer } from './routers/router-for-server.js'

export class WSServer {
  private wss: WebSocketServer
  private activeClients: Clients = new Map()

  constructor({ port }: { port: number }) {
    const server = http.createServer()
    server.listen(port)

    this.wss = new WebSocketServer({ server })
  }

  public listen() {
    let uniqueId = 0

    this.wss.on('connection', socket => {
      const client = new Client(socket, uniqueId)
      this.activeClients.set(uniqueId++, client)

      const subscription = getRequestsWithRouterForServer(client).subscribe({
        complete: () => {
          this.activeClients.delete(client.clientState.id)
          subscription.unsubscribe()
        },
      })
    })

    // the same thing with client state
  }
}
