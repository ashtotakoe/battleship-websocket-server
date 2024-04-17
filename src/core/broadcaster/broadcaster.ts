import { map, merge, Observable, tap } from 'rxjs'

import { BroadcastSources } from '../../shared/enums/enums.js'
import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
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
    merge(
      this.availableGameRooms$.pipe(
        map(gameRooms => ({
          broadcastFrom: BroadcastSources.GameRooms,
          data: gameRooms,
        })),
      ),
    )
      .pipe(
        tap(broadcast => {
          if (broadcast.broadcastFrom === BroadcastSources.GameRooms) {
            this.gameRooms = broadcast.data as GameRoom[]
            this.sendToAllClients(this.gameRooms)
          }
        }),
      )
      .subscribe()
  }

  public syncState(client: Client) {
    client.send(gameRoomsUpdateResponse(this.gameRooms))
  }

  private sendToAllClients(data: GameRoom[]) {
    sendToClients([...this.activeClients.values()], gameRoomsUpdateResponse(data))
  }
}
