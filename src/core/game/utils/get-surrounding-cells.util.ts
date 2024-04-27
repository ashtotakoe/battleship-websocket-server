import { Coordinates } from '../../../shared/models/models.js'
import { GameCell } from '../game-cell.js'
import { filterAllImpossibleSellCoordinates } from './filter-all-impossible-sell-coordinates.util.js'

export function getSurroundingCoordinates({
  shipCells,
  isShipPositionVertical,
}: {
  shipCells: GameCell[]
  isShipPositionVertical: boolean
}): Coordinates[] {
  const surroundingCoordinates = shipCells
    .map(({ coordinates }) => {
      return [
        {
          x: coordinates.x - (isShipPositionVertical ? 1 : 0),
          y: coordinates.y - (isShipPositionVertical ? 0 : 1),
        },
        {
          x: coordinates.x + (isShipPositionVertical ? 1 : 0),
          y: coordinates.y + (isShipPositionVertical ? 0 : 1),
        },
      ]
    })
    .flat()

  const firstCell = shipCells[0]
  const lastCell = shipCells[shipCells.length - 1]

  surroundingCoordinates.unshift(
    ...Array.from({ length: 3 }).map((_, i) => ({
      x: firstCell.coordinates.x + (isShipPositionVertical ? i - 1 : -1),
      y: firstCell.coordinates.y + (isShipPositionVertical ? -1 : i - 1),
    })),
  )

  surroundingCoordinates.push(
    ...Array.from({ length: 3 }).map((_, i) => ({
      x: lastCell.coordinates.x + (isShipPositionVertical ? i - 1 : 1),
      y: lastCell.coordinates.y + (isShipPositionVertical ? +1 : i - 1),
    })),
  )

  return surroundingCoordinates.filter(filterAllImpossibleSellCoordinates)
}
