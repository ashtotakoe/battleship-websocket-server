import { GameRoomCallback } from '../types/types.js'

export interface Message<T> {
  type: string
  data: T
  id: number
}

export interface CreateUserData {
  name: string
  password: string
}

export interface ClientState {
  id: number
  isAuthorized?: boolean
  playerData?: Player
}

export interface Player {
  name: string
  index: number
  password: string
}

export interface GameRoomCallbacks {
  gameIsStarted: GameRoomCallback
  gameIsOver: GameRoomCallback
}
