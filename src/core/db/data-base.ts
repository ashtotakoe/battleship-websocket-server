import { Player } from '../../shared/models/models.js'

class DB {
  private db: Record<string, Player> = {}

  public addPLayer(player: Player): void {
    this.db[player.name] = player
  }

  public getPlayer(name: string): Player | null {
    return this.db[name] ?? null
  }
}

export const db = new DB()
