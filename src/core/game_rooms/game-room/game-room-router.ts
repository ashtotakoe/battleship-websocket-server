import { catchError, filter, map, of, takeWhile, tap, withLatestFrom } from 'rxjs'

import { requestTypesForGameRoom } from '../../../shared/constants/request-types.constant.js'
import { turnOfNobody } from '../../../shared/constants/turn-of-nobody.constant.js'
import { RequestTypes } from '../../../shared/enums/enums.js'
import { AddShipsData, Message } from '../../../shared/models/messages.model.js'
import { GameBoards, Handlers, PlayerTurn } from '../../../shared/types/types.js'
import { nextTurnResponse, startGameResponse } from '../../../shared/utils/responses.utils.js'
import { GameRoom } from './game-room.js'
import { PlayerTurnsObserver } from './game/player-turns-observer.js'

const checkIfBothBoardsAreSet = (gameBoards: GameBoards) =>
  Array.from(gameBoards.values()).every(shipsPosition => shipsPosition.cellsWithShips)

const sendNextTurnResponse = (nextPlayerId: PlayerTurn, gameRoom: GameRoom) => {
  if (nextPlayerId !== turnOfNobody) {
    gameRoom.roomUsers.forEach(user => {
      user.send(nextTurnResponse(nextPlayerId))
    })
  }
}

const handlers: Handlers = {
  [RequestTypes.AddShips]: ({ message, gameRoom, playerTurnsObserver }) => {
    const playerData = (message as Message<AddShipsData>).data
    const game = gameRoom?.game

    if (!playerData || !game || !playerTurnsObserver) {
      return
    }

    game.addShipsForPlayer(playerData.indexPlayer, playerData.ships)

    if (checkIfBothBoardsAreSet(game.gameBoards)) {
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
}

export const getRequestsWithRouterForGameRoom = (gameRoom: GameRoom, playerTurnsObserver: PlayerTurnsObserver) =>
  gameRoom.requests$?.pipe(
    withLatestFrom(playerTurnsObserver.playerTurns$.pipe(tap(nextTurn => sendNextTurnResponse(nextTurn, gameRoom)))),

    takeWhile(
      ([{ client }, nextPlayerId]) =>
        nextPlayerId === turnOfNobody || nextPlayerId === client.clientState.playerData?.temporaryGameId,
    ),

    map(([message]) => message),

    filter(({ message }) => requestTypesForGameRoom.includes(message.type)),

    tap(({ message, client }) => {
      const handler = handlers[message.type]

      if (handler) {
        handler({ message, client, gameRoom, playerTurnsObserver })
      }
    }),

    catchError(error => {
      console.warn(error)

      return of(null)
    }),
  )
