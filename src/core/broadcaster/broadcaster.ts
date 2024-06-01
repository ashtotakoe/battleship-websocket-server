import { combineLatest, map, merge, Observable, switchMap, tap } from 'rxjs'

import { Winner } from '../../shared/models/models.js'
import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse, winnersUpdateResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
import { GameRoom } from '../game-room/game-room.js'
import { Client } from '../server/client.js'

export class Broadcaster {
  private availableGameRoomsCashed: GameRoom[] = []
  private activeClientsCashed: Clients = new Map()
  private winnersCashed: Winner[] = []

  private winners$: Observable<Winner[]>

  constructor(
    private activeClients$: Observable<Clients>,
    private availableGameRooms$: Observable<GameRoom[]>,
  ) {
    this.winners$ = this.activeClients$.pipe(
      tap(activeClients => (this.activeClientsCashed = activeClients)),

      switchMap(activeClients =>
        combineLatest(Array.from(activeClients.values()).map(client => client.playerData$)).pipe(
          map(playersData =>
            playersData
              .filter(playersData => playersData !== null)
              .map(playersData => ({ name: playersData?.name, wins: playersData?.numberOfWins }) as Winner)
              .sort((a, b) => b.wins - a.wins),
          ),

          tap(winners => {
            this.winnersCashed = winners

            this.sendWinnersToAllClients(winners)
          }),
        ),
      ),
    )

    this.availableGameRooms$ = this.availableGameRooms$.pipe(
      tap(availableGameRooms => {
        this.availableGameRoomsCashed = availableGameRooms

        this.sendAvailableGameRoomsToAllClients(availableGameRooms)
      }),
    )
  }

  public broadcast() {
    merge(this.availableGameRooms$, this.winners$).subscribe()
  }

  public syncState(client: Client) {
    client.send(gameRoomsUpdateResponse(this.availableGameRoomsCashed))
    client.send(winnersUpdateResponse(this.winnersCashed))
  }

  private sendAvailableGameRoomsToAllClients(data: GameRoom[]) {
    sendToClients([...this.activeClientsCashed.values()], gameRoomsUpdateResponse(data))
  }

  private sendWinnersToAllClients(winners: Winner[]) {
    sendToClients([...this.activeClientsCashed.values()], winnersUpdateResponse(winners))
  }
}
