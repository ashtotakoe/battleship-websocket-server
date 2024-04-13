import EventEmitter from 'node:events'
import http from 'node:http'
import { WebSocketServer } from 'ws'

import { Events } from '../../shared/enums/enums.js'
import { Clients } from '../../shared/types/types.js'
import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { Broadcaster } from '../broadcaster/broadcaster.js'
import { GameRoomsManager } from '../game_rooms/game-rooms-manager.js'
import { Client } from './client.js'
import { getRequestsWithRouterForServer } from './server-router.js'

export class WSServer {
  private readonly wss: WebSocketServer
  private activeClients: Clients = new Map()
  private gameRoomsManager = new GameRoomsManager()
  private broadcaster = new Broadcaster({
    activeClients: this.activeClients,
    availableGameRooms$: this.gameRoomsManager.availableGameRooms$,
  })

  public eventEmitter = new EventEmitter()

  constructor({ port }: { port: number }) {
    const server = http.createServer()
    server.listen(port)

    this.wss = new WebSocketServer({ server })
    this.setupEmitter()
  }

  public listen() {
    this.broadcaster.broadcast()

    this.wss.on('connection', socket => {
      const client = new Client(socket, generateUniqueIndex())
      this.activeClients.set(client.clientState.id, client)

      const subscription = getRequestsWithRouterForServer(client, this.eventEmitter).subscribe({
        complete: () => {
          this.activeClients.delete(client.clientState.id)
          subscription.unsubscribe()
        },
      })

      // the same thing with client state
    })
  }

  private setupEmitter() {
    this.eventEmitter.addListener(Events.SyncWinnersAndRoomsForClient, (client: Client) => {
      this.broadcaster.syncState(client)
    })

    this.eventEmitter.addListener(Events.CreateRoom, () => {
      this.gameRoomsManager.createGameRoom()
    })

    this.eventEmitter.addListener(Events.AddUserToRoom, (client: Client, roomId: number) => {
      this.gameRoomsManager.addUserToRoom(client, roomId)
    })
  }
}
