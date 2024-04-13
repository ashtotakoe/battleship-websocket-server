import { map, merge, Subscription } from 'rxjs'

import { GameRoomCallbacks } from '../../../shared/models/models.js'
import { generateUniqueIndex } from '../../../shared/utils/generate-unique-index.util.js'
import { createGameResponse } from '../../../shared/utils/responses.utils.js'
import { Client } from '../../server/client.js'
import { getRequestsWithRouterForGameRoom } from './game-rooms-router.js'
import { Game } from './game.js'

export class GameRoom {
  public roomId: number
  public roomUsers: Client[] = []
  public game: Game | null = null

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

    this.game = new Game(this.roomId)
    this.subscription = getRequestsWithRouterForGameRoom(
      merge(...this.roomUsers.map(user => user.requests$.pipe(map(message => ({ message, client: user }))))),
    ).subscribe()

    this.gameRoomCallbacks.gameIsStarted(this.roomId)
    this.roomUsers.forEach(user => {
      this.assignTemporaryGameIdsToUser(user)

      user.send(createGameResponse(user, this))
    })
  }

  private assignTemporaryGameIdsToUser({ clientState }: Client) {
    const { playerData } = clientState

    if (playerData) {
      playerData.temporaryGameId = generateUniqueIndex()
    }
  }
}
