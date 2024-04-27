import { boardLength } from '../../../shared/constants/board-length.constant.js'
import { Coordinates } from '../../../shared/models/models.js'

export const filterAllImpossibleSellCoordinates = (coordinate: Coordinates) =>
  coordinate.x >= 0 && coordinate.y >= 0 && coordinate.x < boardLength && coordinate.y < boardLength
