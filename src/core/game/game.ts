import { boardLength } from '../../shared/constants/board-length.constant.js'
import { AttackStatuses } from '../../shared/enums/enums.js'
import { AttackResults } from '../../shared/models/messages.model.js'
import { Coordinates, Player, Ship, ShipsPosition } from '../../shared/models/models.js'
import { ShipsPositions } from '../../shared/types/types.js'
import { getRandomNumber } from '../../shared/utils/get-random-number.js'
import { GameCell } from './game-cell.js'
import { getSurroundingCoordinates } from './utils/get-surrounding-cells.util.js'

export class Game {
  public shipsPositions: ShipsPositions = new Map()

  constructor(
    public gameId: number,
    public players: Player[],
  ) {
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

  public performRandomAttack(attackingPlayerId: number): {
    attackResults: AttackResults[] | null
    isGameOver: boolean
  } {
    const enemy = this.findOpposingPlayer(attackingPlayerId)
    if (!enemy?.temporaryGameId) return { attackResults: null, isGameOver: false }

    const enemyShipsPosition = this.getShipsPosition(enemy.temporaryGameId)
    if (!enemyShipsPosition || !enemyShipsPosition.notShotCells) return { attackResults: null, isGameOver: false }

    const randomIndex = getRandomNumber(enemyShipsPosition.notShotCells.length)
    const randomTargetCell = enemyShipsPosition.notShotCells[randomIndex]

    return this.performAttack(attackingPlayerId, randomTargetCell.coordinates)
  }

  public performAttack(
    attackingPlayerId: number,
    coordinates: Coordinates,
  ): {
    attackResults: AttackResults[] | null
    isGameOver: boolean
  } {
    const enemy = this.findOpposingPlayer(attackingPlayerId)

    if (!enemy?.temporaryGameId) return { attackResults: null, isGameOver: false }

    const enemyShipsPosition = this.getShipsPosition(enemy.temporaryGameId)
    const cellUnderAttack = enemyShipsPosition?.fullBoard[coordinates.y][coordinates.x]

    if (!enemyShipsPosition || !cellUnderAttack || cellUnderAttack.wasShot)
      return { attackResults: null, isGameOver: false }

    this.markCellAsShot(cellUnderAttack, enemyShipsPosition)

    if (cellUnderAttack.isShipPart) {
      enemyShipsPosition.cellsWithShips = enemyShipsPosition.cellsWithShips?.filter(cell => cell !== cellUnderAttack)
      let isGameOver = false

      const isShipKilled = cellUnderAttack.sameShipCells.every(cell => cell.wasShot)

      const attackResults: AttackResults[] = [
        {
          position: cellUnderAttack.coordinates,
          currentPlayer: attackingPlayerId,
          status: isShipKilled ? AttackStatuses.Killed : AttackStatuses.Shot,
        },
      ]

      if (isShipKilled) {
        attackResults.push(...this.getAttackResultsForSurroundingCellsOfShip(cellUnderAttack, attackingPlayerId))

        attackResults.forEach(({ position }) => {
          const surroundingCell = enemyShipsPosition.fullBoard[position.y][position.x]

          if (surroundingCell) this.markCellAsShot(surroundingCell, enemyShipsPosition)
        })
      }

      if (!this.checkIfEnemyHasAliveShips(enemy.temporaryGameId)) {
        isGameOver = true
      }

      return { attackResults, isGameOver }
    }

    return {
      attackResults: [
        { position: cellUnderAttack.coordinates, currentPlayer: attackingPlayerId, status: AttackStatuses.Miss },
      ],

      isGameOver: false,
    }
  }

  private getAttackResultsForSurroundingCellsOfShip(
    cellUnderAttack: GameCell,
    attackingPlayerId: number,
  ): AttackResults[] {
    return getSurroundingCoordinates({
      shipCells: cellUnderAttack.sameShipCells,
      isShipPositionVertical: cellUnderAttack.ship?.direction ?? false,
    }).map(surroundingCellCoordinates => ({
      position: surroundingCellCoordinates,
      currentPlayer: attackingPlayerId,
      status: AttackStatuses.Miss,
    }))
  }

  private checkIfEnemyHasAliveShips(playerId: number) {
    const shipsPosition = this.getShipsPosition(playerId)

    return shipsPosition?.cellsWithShips?.length !== 0
  }

  public getShips(playerId: number) {
    const shipsPosition = this.getShipsPosition(playerId)

    return shipsPosition?.ships ?? null
  }

  private markCellAsShot(shotCell: GameCell, enemyShipsPosition: ShipsPosition) {
    shotCell.wasShot = true

    enemyShipsPosition.notShotCells = enemyShipsPosition.notShotCells?.filter(notShotCell => notShotCell !== shotCell)
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
