import { Coordinates } from '../../../../shared/models/models.js'

export class GameCell {
  public wasShot = false
  public isShipPart = false

  public coordinates: Coordinates

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates
  }
}
