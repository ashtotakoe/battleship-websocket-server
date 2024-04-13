import EventEmitter from 'node:events'

import { GameRoom } from '../../core/game_rooms/game-room/game-room.js'
import { Client } from '../../core/server/client.js'
import { Message } from '../models/messages.model.js'
import { ShipsPosition } from '../models/models.js'

export type Clients = Map<number, Client>

export type Handler = (handlerArgs: {
  message: Message<unknown>
  client: Client
  allClients?: Clients
  gameRoom?: GameRoom
  eventEmitter?: EventEmitter
}) => void

export type Handlers = Record<string, Handler>

export type GameRoomCallback = (roomId: number) => void

export type ShipSize = 'small' | 'medium' | 'large' | 'huge'

export type GameBoards = Map<number, ShipsPosition>
