import { ShipsPositions } from '../../../../shared/types/types.js'

export const checkIfBothBoardsAreSet = (gameBoards: ShipsPositions) =>
  Array.from(gameBoards.values()).every(shipsPosition => shipsPosition.cellsWithShips)
