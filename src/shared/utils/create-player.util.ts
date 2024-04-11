import { Player } from '../models/models.js'


let index = 0
const getIndex = () => {
  return index++
}

export const createPlayer = (name: string, password: string): Player=> ({
  name,
  password,
  index: getIndex(),
})