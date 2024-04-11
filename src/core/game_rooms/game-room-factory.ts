import { BehaviorSubject } from 'rxjs'

import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { Client } from '../server/client.js'
import { GameRoom } from './game-room.js'

export class GameRoomFactory {
  private readonly availableGameRooms$$ = new BehaviorSubject<GameRoom[]>([])
  public readonly availableGameRooms$ = this.availableGameRooms$$.asObservable()

  public get availableGameRooms() {
    return this.availableGameRooms$$.value
  }

  public createGameRoom() {
    const newRoom = new GameRoom(generateUniqueIndex())
    this.availableGameRooms$$.next([...this.availableGameRooms, newRoom])
  }

  public addUserToRoom(user: Client, roomId: number) {
    const gameRoom = this.availableGameRooms.find(room => room.roomId === roomId)

    if (gameRoom && !gameRoom.roomUsers.includes(user)) {
      gameRoom.addUser(user)
      this.availableGameRooms$$.next(this.availableGameRooms)
    }
  }
}
