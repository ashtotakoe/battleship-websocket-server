import { Client } from '../server/client.js'

export class GameRoom {
  public roomId: number
  public roomUsers: Client[] = []

  constructor(roomId: number) {
    this.roomId = roomId
  }

  public addUser(user: Client) {
    if (
      this.roomUsers.length < 2 &&
      !this.roomUsers.find(userInRoom => userInRoom.clientState.id === user.clientState.id)
    ) {
      this.roomUsers.push(user)
    }
  }

  public removeUser(user: Client) {
    this.roomUsers = this.roomUsers.filter(userInRoom => userInRoom.clientState.id !== user.clientState.id)
  }
}
