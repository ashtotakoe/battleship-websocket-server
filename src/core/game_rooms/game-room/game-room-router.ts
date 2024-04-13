import { catchError, filter, of, tap } from 'rxjs'

import { requestTypesForGameRoom } from '../../../shared/constants/request-types.js'
import { RequestTypes } from '../../../shared/enums/enums.js'
import { AddShipsData, Message } from '../../../shared/models/messages.model.js'
import { GameBoards, Handlers } from '../../../shared/types/types.js'
import { startGameReponse } from '../../../shared/utils/responses.utils.js'
import { GameRoom } from './game-room.js'

const checkIfBothBoardsAreSet = (gameBoards: GameBoards) =>
  Array.from(gameBoards.values()).every(shipsPosition => shipsPosition.cellsWithShips)

const handlers: Handlers = {
  [RequestTypes.AddShips]: ({ message, gameRoom }) => {
    const playerData = (message as Message<AddShipsData>).data
    const game = gameRoom?.game

    if (!playerData || !game) {
      return
    }

    game.addShipsForPlayer(playerData.indexPlayer, playerData.ships)

    if (checkIfBothBoardsAreSet(game.gameBoards)) {
      gameRoom.roomUsers.forEach(user => {
        const temporaryGameId = user.clientState.playerData?.temporaryGameId ?? 0
        const ships = game.getShips(temporaryGameId)

        if (ships?.length && temporaryGameId) {
          user.send(startGameReponse(temporaryGameId, ships))
        }
      })
    }
  },
}

export const getRequestsWithRouterForGameRoom = (gameRoom: GameRoom) =>
  gameRoom.requests$?.pipe(
    filter(({ message }) => requestTypesForGameRoom.includes(message.type)),
    tap(({ message, client }) => {
      const handler = handlers[message.type]

      if (handler) {
        handler({ message, client, gameRoom })
      }
    }),
    catchError(error => {
      console.warn(error)

      return of(null)
    }),
  )
