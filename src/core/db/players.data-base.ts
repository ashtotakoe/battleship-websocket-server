import { Player } from '../../shared/models/models.js'

class PLayersDataBase {
  private readonly players: Map<string, Player> = new Map()

  public addPLayer(player: Player): void {
    this.players.set(player.name, player)
  }

  public getPlayer(name: string): Player | null {
    return this.players.get(name) ?? null
  }
}

export const playersDB = new PLayersDataBase()
