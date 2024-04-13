import { boardLength } from '../../../../shared/constants/board-length.js'
import { Player, Ship } from '../../../../shared/models/models.js'
import { GameBoards } from '../../../../shared/types/types.js'
import { GameCell } from './game-cell.js'

export class Game {
  public gameId: number
  public players: Player[]
  public gameBoards: GameBoards = new Map()

  constructor(gameId: number, players: Player[]) {
    this.gameId = gameId
    this.players = players

    this.createBoards()
  }

  public addShipsForPlayer(playerId: number, ships: Ship[]) {
    const shipsPosition = this.getShipsPosition(playerId)

    if (!shipsPosition) {
      return
    }

    shipsPosition.ships = ships

    shipsPosition.cellsWithShips = ships
      .map(({ position, direction, length }) =>
        Array.from({ length: length }).map((_, index) => {
          const targetCell =
            shipsPosition.fullBoard[position.y + (direction ? index : 0)][position.x + (direction ? 0 : index)]

          targetCell.isShipPart = true
          return targetCell
        }),
      )
      .flat()
  }

  public getShips(playerId: number) {
    const shipsPosition = this.getShipsPosition(playerId)

    return shipsPosition?.ships ?? null
  }

  private getShipsPosition(playerId: number) {
    return this.gameBoards.get(playerId) ?? null
  }

  private createBoards() {
    this.players.forEach(player => {
      if (!player.temporaryGameId) {
        return
      }

      this.gameBoards.set(player.temporaryGameId, {
        fullBoard: Array.from({ length: boardLength }).map((_, y) =>
          Array.from({ length: boardLength }).map((_, x) => new GameCell({ x, y })),
        ),
      })
    })
  }
}
