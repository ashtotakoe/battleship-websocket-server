import { GameCell } from '../../core/game_rooms/game-room/game/game-cell.js'
import { Coordinates } from '../models/models.js'

export function getSurroundingCoordinates(shipCells: GameCell[], isVertical: boolean): Coordinates[] {
  const surroundingCoordinates = shipCells
    .map(({ coordinates }) => {
      return [
        {
          x: coordinates.x - (isVertical ? 1 : 0),
          y: coordinates.y - (isVertical ? 0 : 1),
        },
        {
          x: coordinates.x + (isVertical ? 1 : 0),
          y: coordinates.y + (isVertical ? 0 : 1),
        },
      ]
    })
    .flat()

  const firstCell = shipCells[0]
  const lastCell = shipCells[shipCells.length - 1]

  surroundingCoordinates.unshift(
    ...Array.from({ length: 3 }).map((_, i) => ({
      x: firstCell.coordinates.x + (isVertical ? i - 1 : -1),
      y: firstCell.coordinates.y + (isVertical ? -1 : i - 1),
    })),
  )

  surroundingCoordinates.push(
    ...Array.from({ length: 3 }).map((_, i) => ({
      x: lastCell.coordinates.x + (isVertical ? i - 1 : 1),
      y: lastCell.coordinates.y + (isVertical ? +1 : i - 1),
    })),
  )

  return surroundingCoordinates.filter(coordinate => coordinate.x >= 0 && coordinate.y >= 0)
}
