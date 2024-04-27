import { BehaviorSubject } from 'rxjs'

import { GameRoomCallbacks } from '../../shared/models/models.js'
import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { GameRoom } from '../game-room/game-room.js'
import { Client } from '../server/client.js'

export class GameRoomsManager {
  private readonly availableGameRooms$$ = new BehaviorSubject<GameRoom[]>([])
  private gameRoomCallbacks: GameRoomCallbacks = {
    gameIsCreated: roomId => {
      const room = this.findRoomById(roomId)

      if (room) {
        this.usersCurrentlyInGame.push(...room.roomUsers)

        this.availableGameRooms$$.next(this.removeRoomById(roomId))
      }
    },
    gameIsOver: roomId => {
      const endedGameRoom = this.findRoomById(roomId)

      if (endedGameRoom) {
        this.usersCurrentlyInGame.filter(user => !endedGameRoom.roomUsers.includes(user))
      }
    },
  }

  public usersCurrentlyInGame: Client[] = []
  public readonly availableGameRooms$ = this.availableGameRooms$$.asObservable()

  public get availableGameRooms() {
    return this.availableGameRooms$$.value
  }

  public createGameRoom() {
    const newRoom = new GameRoom(generateUniqueIndex(), this.gameRoomCallbacks)

    this.availableGameRooms$$.next([...this.availableGameRooms, newRoom])
  }

  public addUserToRoom(user: Client, roomId: number) {
    const targetRoom = this.findRoomById(roomId)

    if (this.canUserBeAddedToRoom(targetRoom, user)) {
      const otherRoomWithUser = this.availableGameRooms.find(room => room.roomUsers.includes(user))
      otherRoomWithUser?.removeUser(user)

      targetRoom?.addUser(user)
      this.availableGameRooms$$.next(this.availableGameRooms)
    }
  }

  private canUserBeAddedToRoom(room: GameRoom | undefined, user: Client) {
    return room && !room.roomUsers.includes(user) && !this.usersCurrentlyInGame.includes(user)
  }

  private findRoomById(roomId: number) {
    return this.availableGameRooms.find(room => room.roomId === roomId)
  }

  private removeRoomById(roomId: number) {
    return this.availableGameRooms.filter(room => room.roomId !== roomId)
  }
}
