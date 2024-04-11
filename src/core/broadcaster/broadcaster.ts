import { Observable, tap } from 'rxjs'

import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse } from '../../shared/utils/responses.js'
import { GameRoom } from '../game_rooms/game-room.js'
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
          console.log('rrrrefresh')
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

  public syncStateWithAll() {
    this.activeClients.forEach(client => {
      client.send(gameRoomsUpdateResponse(this.gameRooms))
    })
  }

  public syncStateWithOne(client: Client) {
    client.send(gameRoomsUpdateResponse(this.gameRooms))
  }
}
