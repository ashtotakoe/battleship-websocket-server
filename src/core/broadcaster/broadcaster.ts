import { merge, Observable, switchMap, tap } from 'rxjs'

import { Winner } from '../../shared/models/models.js'
import { Clients } from '../../shared/types/types.js'
import { gameRoomsUpdateResponse, winnersUpdateResponse } from '../../shared/utils/responses.utils.js'
import { sendToClients } from '../../shared/utils/send-to-clients.util.js'
import { winnersDB } from '../db/winners.data-base.js'
import { GameRoom } from '../game-room/game-room.js'
import { Client } from '../server/client.js'

export class Broadcaster {
  private availableGameRoomsCashed: GameRoom[] = []
  private activeClientsCashed: Clients = new Map()

  constructor(
    private activeClients$: Observable<Clients>,
    private availableGameRooms$: Observable<GameRoom[]>,
  ) {}

  public broadcast() {
    merge(
      this.availableGameRooms$.pipe(
        tap(availableGameRooms => {
          this.availableGameRoomsCashed = availableGameRooms

          this.sendAvailableGameRoomsToAllClients(availableGameRooms)
        }),
      ),
      this.activeClients$.pipe(
        tap(activeClients => (this.activeClientsCashed = activeClients)),
        switchMap(clients =>
          merge(...Array.from(clients.values()).map(client => client.playerData$)).pipe(
            tap(playerData => {
              if (!playerData) return

              winnersDB.addWinnerData(playerData.name, playerData.numberOfWins ?? 0)

              this.sendWinnersToAllClients(winnersDB.getWinnersData())
            }),
          ),
        ),
      ),
    ).subscribe()
  }

  public syncState(client: Client) {
    client.send(gameRoomsUpdateResponse(this.availableGameRoomsCashed))

    client.send(winnersUpdateResponse(winnersDB.getWinnersData()))
  }

  private sendAvailableGameRoomsToAllClients(data: GameRoom[]) {
    sendToClients([...this.activeClientsCashed.values()], gameRoomsUpdateResponse(data))
  }

  private sendWinnersToAllClients(winners: Winner[]) {
    sendToClients([...this.activeClientsCashed.values()], winnersUpdateResponse(winners))
  }
}
