import { RequestTypes } from '../../../shared/enums/enums.js'
import { AddShipsData, AttackData, Message } from '../../../shared/models/messages.model.js'
import { Handlers } from '../../../shared/types/types.js'
import {
  attackResultsResponse,
  startGameResponse,
} from '../../../shared/utils/responses.utils.js'
import { sendToClients } from '../../../shared/utils/send-to-clients.util.js'
import { checkIfBothBoardsAreSet } from './router-utils/check-if-all-boards-are-set.util.js'
import { handleGameOver } from './router-utils/handle-game-over.util.js'

export const gameRoomRouterHandlers: Handlers = {
  [RequestTypes.AddShips]: ({ message, gameRoom, playerTurnsObserver }) => {
    const playerData = (message as Message<AddShipsData>).data
    const game = gameRoom?.game

    if (!playerData || !game || !playerTurnsObserver) {
      return
    }

    game.addShipsForPlayer(playerData.indexPlayer, playerData.ships)

    if (checkIfBothBoardsAreSet(game.shipsPositions)) {
      playerTurnsObserver.firstTurn()

      gameRoom.roomUsers.forEach(user => {
        const temporaryGameId = user.clientState.playerData?.temporaryGameId ?? 0
        const ships = game.getShips(temporaryGameId)

        if (ships?.length && temporaryGameId) {
          user.send(startGameResponse(temporaryGameId, ships))
        }
      })
    }
  },

  [RequestTypes.RandomAttack]: ({ client, gameRoom, playerTurnsObserver }) => {
    const playerId = client.clientState.playerData?.temporaryGameId

    if (!gameRoom || !gameRoom.game || !playerId || !playerTurnsObserver) {
      return
    }

    const { attackResults, isGameOver } = gameRoom.game.performRandomAttack(playerId)

    if (!attackResults) return

    attackResults.forEach(attackResult => sendToClients(gameRoom.roomUsers, attackResultsResponse(attackResult)))

    if (isGameOver) {
      handleGameOver(gameRoom, playerId)
    }

    playerTurnsObserver.nextTurn()
  },

  [RequestTypes.Attack]: ({ message, client, gameRoom, playerTurnsObserver }) => {
    const { x, y } = (message as Message<AttackData>).data
    const playerId = client.clientState.playerData?.temporaryGameId

    if (!gameRoom || !gameRoom.game || !playerTurnsObserver || !playerId) {
      return
    }

    const { attackResults, isGameOver } = gameRoom.game.performAttack(playerId, { x, y })

    if (!attackResults) return

    attackResults.forEach(attackResult => sendToClients(gameRoom.roomUsers, attackResultsResponse(attackResult)))

    if (isGameOver) {
      handleGameOver(gameRoom, playerId)
    }

    playerTurnsObserver.nextTurn()
  },
}
