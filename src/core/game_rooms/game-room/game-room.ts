import { map, merge, Subscription, tap } from 'rxjs'

import { GameRoomCallbacks } from '../../../shared/models/models.js'
import { Client } from '../../server/client.js'

export class GameRoom {
  public roomId: number
  public roomUsers: Client[] = []

  private readonly gameRoomCallbacks: GameRoomCallbacks
  private subscription?: Subscription

  constructor(roomId: number, gamerRoomCallbacks: GameRoomCallbacks) {
    this.roomId = roomId
    this.gameRoomCallbacks = gamerRoomCallbacks
  }

  public addUser(user: Client) {
    if (this.roomUsers.length < 2 && !this.roomUsers.includes(user)) {
      this.roomUsers.push(user)
    }

    if (this.roomUsers.length === 2) {
      this.gameIsStarted()
    }
  }

  public removeUser(user: Client) {
    this.roomUsers = this.roomUsers.filter(userInRoom => userInRoom !== user)
  }

  private gameIsStarted() {
    console.log('GAME IS STARTED')
    this.subscription = merge(
      ...this.roomUsers.map(user =>
        user.requests$.pipe(map(message => ({ message, player: user.clientState.playerData }))),
      ),
    )
      .pipe(tap(message => console.log(message)))
      .subscribe()

    this.gameRoomCallbacks.gameIsStarted(this.roomId)
  }
}
