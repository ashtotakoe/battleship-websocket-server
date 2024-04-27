import { ReplaySubject, tap } from 'rxjs'

import { turnOfNobody } from '../../shared/constants/turn-of-nobody.constant.js'
import { Player } from '../../shared/models/models.js'
import { PlayerTurn } from '../../shared/types/types.js'
import { nextTurnResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
import { Client } from '../server/client.js'

export class PlayerTurnsObserver {
  private playerTurns$$ = new ReplaySubject<PlayerTurn>(1)
  private playerIds: number[]
  private lastIndex: 0 | 1 = 0

  public playerTurns$ = this.playerTurns$$.asObservable().pipe(tap(nextTurn => this.sendNextTurnResponse(nextTurn)))

  constructor(
    players: Player[],
    private roomUsers: Client[],
  ) {
    this.playerIds = players.map(player => player.temporaryGameId ?? 0)

    this.playerTurns$$.next(turnOfNobody)
  }

  public firstTurn() {
    const randomIndex = this.getRandomIndex()
    const playerId = this.playerIds[randomIndex]

    this.lastIndex = randomIndex
    this.playerTurns$$.next(playerId)
  }

  private sendNextTurnResponse(nextPlayerId: PlayerTurn) {
    if (nextPlayerId !== turnOfNobody) {
      sendToClients(this.roomUsers, nextTurnResponse(nextPlayerId))
    }
  }

  public nextTurn() {
    if (this.lastIndex === 0) {
      this.playerTurns$$.next(this.playerIds[1])
      this.lastIndex = 1

      return
    }

    this.playerTurns$$.next(this.playerIds[0])
    this.lastIndex = 0
  }

  private getRandomIndex() {
    return Math.random() > 0.5 ? 1 : 0
  }
}
