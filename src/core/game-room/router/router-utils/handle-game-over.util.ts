import { gameFinishedResponse } from '../../../../shared/utils/responses.utils.js'
import { sendToClients } from '../../../../shared/utils/send-to-clients.util.js'
import { GameRoom } from '../../game-room.js'

export const handleGameOver = (gameRoom: GameRoom, playerId: number) => {
  gameRoom.gameRoomCallbacks.gameIsOver(gameRoom, playerId)

  sendToClients(gameRoom.roomUsers, gameFinishedResponse(playerId))
}
