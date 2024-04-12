import { Observable, tap } from 'rxjs'

import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse } from '../../shared/utils/responses.utils.js'
import { GameRoom } from '../game_rooms/game-room/game-room.js'
import { Client } from '../server/client.js'

export class Broadcaster {
  private activeClients: Clients
  private availableGameRooms$: Observable<GameRoom[]>
  private gameRooms: GameRoom[] = []

  constructor({
    activeClients,
    availableGameRooms$,
  }: {
    activeClients: Clients
    availableGameRooms$: Observable<GameRoom[]>
  }) {
    this.activeClients = activeClients
    this.availableGameRooms$ = availableGameRooms$
  }

  public broadcast() {
    this.availableGameRooms$
      .pipe(
        tap(gameRooms => {
          this.gameRooms = gameRooms

          this.activeClients.forEach(client => {
            client.send(gameRoomsUpdateResponse(gameRooms))
          })
        }),
      )
      .subscribe()
  }

  public syncState(client: Client) {
    client.send(gameRoomsUpdateResponse(this.gameRooms))
  }
}
