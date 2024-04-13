import { filter, Observable, tap } from 'rxjs'

import { requestTypesForGameRoom } from '../../../shared/constants/request-types.js'
import { RequestToGameRoom } from '../../../shared/models/models.js'
import { Handlers } from '../../../shared/types/types.js'

const handlers: Handlers = {}

export const getRequestsWithRouterForGameRoom = (requestsToGameRoom$: Observable<RequestToGameRoom>) =>
  requestsToGameRoom$.pipe(
    filter(({ message }) => requestTypesForGameRoom.includes(message.type)),

    tap(({ message, client }) => {
      console.log({ message, client })

      const handler = handlers[message.type]
      if (handler) {
        handler({ message, client })
      }
    }),
  )
