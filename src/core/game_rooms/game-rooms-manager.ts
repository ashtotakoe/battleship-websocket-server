import { BehaviorSubject } from 'rxjs'

import { generateUniqueIndex } from '../../shared/utils/generate-unique-index.util.js'
import { Client } from '../server/client.js'
import { GameRoom } from './game-room.js'

export class GameRoomsManager {
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
    const targetRoom = this.availableGameRooms.find(room => room.roomId === roomId)

    if (targetRoom && !targetRoom.roomUsers.includes(user)) {
      const otherRoomWithUser = this.availableGameRooms.find(room => room.roomUsers.includes(user))
      otherRoomWithUser?.removeUser(user)

      targetRoom.addUser(user)
      this.availableGameRooms$$.next(this.availableGameRooms)
    }
  }
}
