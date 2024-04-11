import { Player } from '../models/models.js'

export const createPlayer = (name: string, password: string, index: number): Player => ({
  name,
  password,
  index,
})
