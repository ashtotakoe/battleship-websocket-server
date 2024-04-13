import { Ship } from './models.js'

export interface Message<T> {
  type: string
  data: T
  id: number
}

export interface CreateUserData {
  name: string
  password: string
}

export interface AddShipsData {
  gameId: number
  ships: Ship[]
  indexPlayer: number
}

export interface StartGameData {
  ships: Ship[]
  currentPlayerIndex: number
}
