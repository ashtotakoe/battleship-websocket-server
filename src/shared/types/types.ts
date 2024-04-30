import EventEmitter from 'node:events'

import { GameRoom } from '../../core/game-room/game-room.js'
import { PlayerTurnsObserver } from '../../core/game/player-turns-observer.js'
import { Client } from '../../core/server/client.js'
import { turnOfNobody } from '../constants/turn-of-nobody.constant.js'
import { Message } from '../models/messages.model.js'
import { ShipsPosition } from '../models/models.js'

export type Clients = Map<number, Client>

export type Handler = (handlerArgs: {
  message: Message<unknown>
  client: Client
  allClients?: Clients
  gameRoom?: GameRoom
  eventEmitter?: EventEmitter
  playerTurnsObserver?: PlayerTurnsObserver
}) => void

export type Handlers = Record<string, Handler>

export type GameStartedCallback = (startedGameRoom: GameRoom) => void
export type GameOverCallback = (endedGameRoom: GameRoom, winnerId: number) => void

export type ShipSize = 'small' | 'medium' | 'large' | 'huge'

export type ShipsPositions = Map<number, ShipsPosition>

export type PlayerTurn = number | typeof turnOfNobody

export type AttackStatus = 'miss' | 'killed' | 'shot'
export type Winners = Map<string, number>
