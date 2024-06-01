import { GameCell } from '../../core/game/game-cell.js'
import { Client } from '../../core/server/client.js'
import { GameOverCallback, GameStartedCallback, ShipSize } from '../types/types.js'
import { AttackResults, Message } from './messages.model.js'

export interface ClientState {
  id: number
  isAuthorized?: boolean
  playerData?: Player
}

export interface Player {
  name: string
  index: number
  password: string
  numberOfWins: number
  temporaryGameId?: number
}

export interface Winner {
  name: string
  wins: number
}

export interface GameRoomCallbacks {
  gameIsCreated: GameStartedCallback
  gameIsOver: GameOverCallback
}

export interface RequestToGameRoom {
  message: Message<unknown>
  client: Client
}

export interface Ship {
  position: {
    x: number
    y: number
  }
  direction: boolean
  length: number
  type: ShipSize
}

export interface ShipsPosition {
  fullBoard: GameCell[][]
  cellsWithShips?: GameCell[]
  notShotCells?: GameCell[]
  ships?: Ship[]
}

export interface Coordinates {
  x: number
  y: number
}

export interface AfterAttackData {
  attackResults: AttackResults[] | null
  isGameOver: boolean
}
