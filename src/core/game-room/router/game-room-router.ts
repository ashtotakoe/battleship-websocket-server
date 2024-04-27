import { catchError, filter, map, of, tap, withLatestFrom } from 'rxjs'

import { requestTypesForGameRoom } from '../../../shared/constants/request-types.constant.js'
import { turnOfNobody } from '../../../shared/constants/turn-of-nobody.constant.js'
import { PlayerTurnsObserver } from '../../game/player-turns-observer.js'
import { GameRoom } from '../game-room.js'
import { gameRoomRouterHandlers } from './game-room-router.handlers.js'

export const getRequestsWithRouterForGameRoom = (gameRoom: GameRoom, playerTurnsObserver: PlayerTurnsObserver) => {
  return gameRoom.requests$?.pipe(
    withLatestFrom(playerTurnsObserver.playerTurns$),

    filter(
      ([{ client }, nextPlayerId]) =>
        nextPlayerId === turnOfNobody || nextPlayerId === client.clientState.playerData?.temporaryGameId,
    ),

    map(([request]) => request),

    filter(({ message }) => requestTypesForGameRoom.includes(message.type)),

    tap(({ message, client }) => {
      const handler = gameRoomRouterHandlers[message.type]

      if (handler) {
        handler({ message, client, gameRoom, playerTurnsObserver })
      }
    }),

    catchError(error => {
      console.warn(error)

      return of(null)
    }),
  )
}
