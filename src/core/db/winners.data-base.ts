import { Winner } from '../../shared/models/models.js'
import { Winners } from '../../shared/types/types.js'

class WinnersDataBase {
  private readonly winners: Winners = new Map()

  public addWinnerData(name: string, numberOfWins: number): void {
    this.winners.set(name, numberOfWins)
  }

  public getWinnersData(): Winner[] {
    return [...this.winners.entries()].map(([name, wins]) => ({ name, wins }))
  }
}

export const winnersDB = new WinnersDataBase()
