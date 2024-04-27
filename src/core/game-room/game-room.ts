import { map, merge, Observable, Subscription } from 'rxjs'

import { GameRoomCallbacks, Player, RequestToGameRoom } from '../../shared/models/models.js'
import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { createGameResponse } from '../../shared/utils/responses.utils.js'
import { Game } from '../game/game.js'
import { PlayerTurnsObserver } from '../game/player-turns-observer.js'
import { Client } from '../server/client.js'
import { getRequestsWithRouterForGameRoom } from './router/game-room-router.js'

export class GameRoom {
  public roomUsers: Client[] = []
  public game: Game | null = null
  public requests$: Observable<RequestToGameRoom> | null = null

  private subscription?: Subscription

  constructor(
    public roomId: number,
    public readonly gameRoomCallbacks: GameRoomCallbacks,
  ) {}

  public addUser(user: Client) {
    if (this.roomUsers.length < 2 && !this.roomUsers.includes(user)) {
      this.roomUsers.push(user)
    }

    if (this.roomUsers.length === 2) {
      this.createGame()
    }
  }

  public removeUser(user: Client) {
    this.roomUsers = this.roomUsers.filter(userInRoom => userInRoom !== user)
  }

  private createGame() {
    this.gameRoomCallbacks.gameIsCreated(this.roomId)

    this.roomUsers.forEach(user => {
      this.assignTemporaryGameIdsToUser(user)

      user.send(createGameResponse(user, this))
    })

    this.game = new Game(
      this.roomId,
      this.roomUsers.map(({ clientState }) => clientState.playerData as Player),
    )

    this.setUpRequestsFromUsers()
  }

  private assignTemporaryGameIdsToUser({ clientState }: Client) {
    const { playerData } = clientState

    if (playerData) {
      playerData.temporaryGameId = generateUniqueIndex()
    }
  }

  private setUpRequestsFromUsers() {
    this.requests$ = merge(
      ...this.roomUsers.map(user =>
        user.requests$.pipe(
          map(message => ({
            message,
            client: user,
          })),
        ),
      ),
    )

    this.subscription = getRequestsWithRouterForGameRoom(
      this,
      new PlayerTurnsObserver(
        this.roomUsers.map(user => user.clientState.playerData as Player),
        this.roomUsers,
      ),
    )?.subscribe()
  }
}
