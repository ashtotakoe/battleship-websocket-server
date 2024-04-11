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
  player?: Player
}

export interface Player {
  name: string
  index: number,
  password: string
}


