import { Coordinates, Ship } from '../../../../shared/models/models.js'

export class GameCell {
  public wasShot = false
  public isShipPart = false
  public sameShipCells: GameCell[] = []
  public ship: Ship | null = null

  constructor(public coordinates: Coordinates) {}
}
