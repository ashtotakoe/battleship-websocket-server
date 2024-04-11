import EventEmitter from 'node:events'
import http from 'node:http'
import { WebSocketServer } from 'ws'

import { Events } from '../../shared/enums/enums.js'
import { Clients } from '../../shared/types/types.js'
import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { Broadcaster } from '../broadcaster/broadcaster.js'
import { GameRoomFactory } from '../game_rooms/game-room-factory.js'
import { Client } from './client.js'
import { getRequestsWithRouterForServer } from './routers/router-for-server.js'

export class WSServer {
  private wss: WebSocketServer
  private activeClients: Clients = new Map()
  private gameRoomFactory = new GameRoomFactory()
  private broadcaster = new Broadcaster({
    activeClients: this.activeClients,
    availableGameRooms$: this.gameRoomFactory.availableGameRooms$,
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
    this.eventEmitter.addListener(Events.SYNC_WINNERS_AND_ROOMS_FOR_CLIENT, (client: Client) => {
      this.broadcaster.syncStateWithOne(client)
    })

    this.eventEmitter.addListener(Events.CREATE_ROOM, () => {
      this.gameRoomFactory.createGameRoom()
    })

    this.eventEmitter.addListener(Events.ADD_USER_TO_ROOM, (client: Client, roomId: number) => {
      this.gameRoomFactory.addUserToRoom(client, roomId)
    })
  }
}
