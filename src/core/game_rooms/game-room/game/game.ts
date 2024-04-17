import { boardLength } from '../../../../shared/constants/board-length.constant.js'
import { AttackStatuses } from '../../../../shared/enums/enums.js'
import { AttackResults } from '../../../../shared/models/messages.model.js'
import { Coordinates, Player, Ship } from '../../../../shared/models/models.js'
import { ShipsPositions } from '../../../../shared/types/types.js'
import { getRandomNumber } from '../../../../shared/utils/get-random-number.js'
import {
  getSurroundingCoordinates,
} from '../../../../shared/utils/get-surrounding-cells.util.js'
import { GameCell } from './game-cell.js'

export class Game {
  public gameId: number
  public players: Player[]
  public shipsPositions: ShipsPositions = new Map()

  constructor(gameId: number, players: Player[]) {
    this.gameId = gameId
    this.players = players

    this.createBoards()
  }

  public addShipsForPlayer(playerId: number, ships: Ship[]) {
    const shipsPosition = this.getShipsPosition(playerId)

    if (!shipsPosition) return

    shipsPosition.ships = ships

    shipsPosition.cellsWithShips = ships
      .map(ship => {
        const shipCells = Array.from({ length: ship.length }).map((_, index) => {
          const targetCell =
            shipsPosition.fullBoard[ship.position.y + (ship.direction ? index : 0)][
              ship.position.x + (ship.direction ? 0 : index)
            ]

          targetCell.isShipPart = true
          targetCell.ship = ship
          return targetCell
        })

        shipCells.forEach(cell => (cell.sameShipCells = shipCells))

        return shipCells
      })
      .flat()

    shipsPosition.notShotCells = shipsPosition.fullBoard.flat()
  }

  public getShips(playerId: number) {
    const shipsPosition = this.getShipsPosition(playerId)

    return shipsPosition?.ships ?? null
  }

  public performRandomAttack(attackingPlayerId: number): AttackResults[] | null {
    const enemy = this.findOpposingPlayer(attackingPlayerId)
    if (!enemy?.temporaryGameId) return []

    const enemyShipsPosition = this.getShipsPosition(enemy.temporaryGameId)
    if (!enemyShipsPosition || !enemyShipsPosition.notShotCells) return []

    const randomIndex = getRandomNumber(enemyShipsPosition.notShotCells.length)
    const randomTargetCell = enemyShipsPosition.notShotCells[randomIndex]

    enemyShipsPosition.notShotCells.filter((_, cellIndex) => cellIndex !== randomIndex)

    return this.performAttack(attackingPlayerId, randomTargetCell.coordinates)
  }

  public performAttack(attackingPlayerId: number, coordinates: Coordinates): AttackResults[] | null {
    const enemy = this.findOpposingPlayer(attackingPlayerId)

    if (!enemy?.temporaryGameId) return []

    const enemyShipsPosition = this.getShipsPosition(enemy.temporaryGameId)
    const cellUnderAttack = enemyShipsPosition?.fullBoard[coordinates.y][coordinates.x]

    if (!enemyShipsPosition || !cellUnderAttack || cellUnderAttack.wasShot) return null

    cellUnderAttack.wasShot = true

    if (cellUnderAttack.isShipPart) {
      const isShipKilled = cellUnderAttack.sameShipCells.every(cell => cell.wasShot)

      const results = [
        {
          position: cellUnderAttack.coordinates,
          currentPlayer: attackingPlayerId,
          status: isShipKilled ? AttackStatuses.Killed : AttackStatuses.Shot,
        },
      ]

      if (isShipKilled) {
        results.push(
          ...(cellUnderAttack.ship?.direction
            ? getSurroundingCoordinates(cellUnderAttack.sameShipCells, true).map(surroundingCellCoordinates => ({
              position: surroundingCellCoordinates,
              currentPlayer: attackingPlayerId,
              status: AttackStatuses.Miss,
            }))
            : getSurroundingCoordinates(cellUnderAttack.sameShipCells, false).map(surroundingCellCoordinates => ({
              position: surroundingCellCoordinates,
              currentPlayer: attackingPlayerId,
              status: AttackStatuses.Miss,
            }))),
        )
      }

      return results
    }

    return [{ position: cellUnderAttack.coordinates, currentPlayer: attackingPlayerId, status: AttackStatuses.Miss }]
  }

  private getShipsPosition(playerId: number) {
    return this.shipsPositions.get(playerId) ?? null
  }

  private createBoards() {
    this.players.forEach(player => {
      if (!player.temporaryGameId) return

      this.shipsPositions.set(player.temporaryGameId, {
        fullBoard: Array.from({ length: boardLength }).map((_, y) =>
          Array.from({ length: boardLength }).map((_, x) => new GameCell({ x, y })),
        ),
      })
    })
  }

  private findOpposingPlayer(playerId: number) {
    return this.players.find(player => player.temporaryGameId !== playerId) ?? null
  }
}
