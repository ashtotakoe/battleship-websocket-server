import { map, merge, Observable, scan, shareReplay, switchMap, take, tap } from 'rxjs'

import { Winner } from '../../shared/models/models.js'
import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse, winnersUpdateResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
import { winnersDB } from '../db/winners.data-base.js'
import { GameRoom } from '../game-room/game-room.js'
import { Client } from '../server/client.js'

export interface BroadcastData {
  type: 'winners' | 'game-rooms'
  payload: Winner[]
}

export class Broadcaster {
  private availableGameRoomsCashed: GameRoom[] = []
  private activeClientsCashed: Clients = new Map()

  private winners$: Observable<Winner[]>

  constructor(
    private activeClients$: Observable<Clients>,
    private availableGameRooms$: Observable<GameRoom[]>,
  ) {
    this.activeClients$ = this.activeClients$.pipe(
      shareReplay(1),
      tap(val => {
        console.log('active clients', val)
      }),
    )

    this.winners$ = this.activeClients$.pipe(
      switchMap(activeClients =>
        merge(...Array.from(activeClients.values()).map(client => client.playerData$)).pipe(
          scan(
            (winners: Winner[], playerData) =>
              playerData
                ? [...winners, { name: playerData.name, wins: playerData.numberOfWins }].sort((a, b) => a.wins - b.wins)
                : winners,
            [],
          ),
          shareReplay(1),
          tap(winners => this.sendWinnersToAllClients(winners)),
        ),
      ),
      tap(val => console.log('winners', val)),
    )

    this.availableGameRooms$ = this.availableGameRooms$.pipe(
      shareReplay(1),
      tap(availableGameRooms => this.sendAvailableGameRoomsToAllClients(availableGameRooms)),
      tap(val => console.log('available game rooms', val)),
    )
  }

  public broadcast() {
    merge(this.availableGameRooms$, this.winners$).subscribe()
  }

  public syncState(client: Client) {
    console.log('sync state for', client.clientState.playerData?.name)

    this.availableGameRooms$
      .pipe(
        take(1),
        // tap(val => console.log('syncing available game rooms', val)),
      )
      .subscribe(availableGameRooms => client.send(gameRoomsUpdateResponse(availableGameRooms)))

    this.winners$
      .pipe(
        take(1),
        // tap(val => console.log('syncing winners', val)),
      )
      .subscribe(winners => client.send(winnersUpdateResponse(winners)))
  }

  private sendAvailableGameRoomsToAllClients(data: GameRoom[]) {
    this.activeClients$.pipe(take(1)).subscribe(activeClients => {
      sendToClients([...activeClients.values()], gameRoomsUpdateResponse(data))
    })
  }

  private sendWinnersToAllClients(winners: Winner[]) {
    this.activeClients$.pipe(take(1)).subscribe(activeClients => {
      sendToClients([...activeClients.values()], winnersUpdateResponse(winners))
    })
  }
}
