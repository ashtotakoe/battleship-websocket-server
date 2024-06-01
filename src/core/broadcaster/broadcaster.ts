import { merge, Observable, scan, switchMap, tap } from 'rxjs'

import { Winner } from '../../shared/models/models.js'
import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse, winnersUpdateResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
import { GameRoom } from '../game-room/game-room.js'
import { Client } from '../server/client.js'

export interface BroadcastData {
  type: 'winners' | 'game-rooms'
  payload: Winner[]
}

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
        merge(...Array.from(activeClients.values()).map(client => client.playerData$)).pipe(
          tap(data => console.log('player data', data)), // emits null
          scan(
            (winners: Winner[], playerData) =>
              playerData
                ? [...winners, { name: playerData.name, wins: playerData.numberOfWins }].sort((a, b) => b.wins - a.wins)
                : winners,
            [],
          ),
          tap(winners => {
            this.winnersCashed = winners

            this.sendWinnersToAllClients(winners)
          }),
        ),
      ),

      tap(value => console.log('winners', value)), // debug
    )

    this.availableGameRooms$ = this.availableGameRooms$.pipe(
      tap(availableGameRooms => {
        this.availableGameRoomsCashed = availableGameRooms

        this.sendAvailableGameRoomsToAllClients(availableGameRooms)
      }),

      tap(value => console.log('available game rooms', value)), // debug
    )
  }

  public broadcast() {
    merge(this.availableGameRooms$, this.winners$).subscribe()

    this.activeClients$.subscribe(activeClients => console.log('active clients', activeClients))
  }

  public syncState(client: Client) {
    console.log('sync state for', client.clientState.playerData?.name)

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
