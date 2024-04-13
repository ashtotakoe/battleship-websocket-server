import { GameRoom } from '../../core/game_rooms/game-room/game-room.js'
import { Client } from '../../core/server/client.js'
import { ResponseTypes } from '../enums/enums.js'
import { Player, Ship } from '../models/models.js'
import { createResponse } from './create-response.util.js'

export const userIsAuthorizedResponse = (player: Player) =>
  createResponse(ResponseTypes.Registration, {
    name: player.name,
    index: player.index,
    error: false,
    errorText: '',
  })

export const wrongPasswordResponse = () =>
  createResponse(ResponseTypes.Registration, {
    error: true,
    errorText: 'Wrong password',
  })

export const gameRoomsUpdateResponse = (gameRooms: GameRoom[]) =>
  createResponse(
    ResponseTypes.UpdateRoom,
    gameRooms.map(room => ({
      roomId: room.roomId,
      roomUsers: Object.values(room.roomUsers).map((user: Client) => ({
        name: user.clientState.playerData?.name,
        index: user.clientState.playerData?.index,
      })),
    })),
  )

export const createGameResponse = (user: Client, gameRoom: GameRoom) =>
  createResponse(ResponseTypes.CreateGame, {
    idGame: gameRoom.game?.gameId,
    idPlayer: user.clientState.playerData?.temporaryGameId,
  })

export const startGameReponse = (playerId: number, ships: Ship[]) =>
  createResponse(ResponseTypes.StartGame, {
    ships,
    currentPlayerIndex: playerId,
  })
