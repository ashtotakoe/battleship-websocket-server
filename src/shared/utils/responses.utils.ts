import { GameRoom } from '../../core/game_rooms/game-room/game-room.js'
import { Client } from '../../core/server/client.js'
import { Player } from '../models/models.js'
import { createResponse } from './create-response.util.js'

export const userIsAuthorizedResponse = (player: Player) =>
  createResponse('reg', {
    name: player.name,
    index: player.index,
    error: false,
    errorText: '',
  })

export const wrongPasswordResponse = () =>
  createResponse('reg', {
    error: true,
    errorText: 'Wrong password',
  })

export const gameRoomsUpdateResponse = (gameRooms: GameRoom[]) =>
  createResponse(
    'update_room',
    gameRooms.map(room => ({
      roomId: room.roomId,
      roomUsers: [
        ...Object.values(room.roomUsers).map((user: Client) => ({
          name: user.clientState.playerData?.name,
          index: user.clientState.playerData?.index,
        })),
      ],
    })),
  )
