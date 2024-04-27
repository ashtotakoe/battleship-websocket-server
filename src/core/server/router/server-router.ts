import EventEmitter from 'node:events'
import { catchError, filter, of, tap } from 'rxjs'

import { requestTypesForServer } from '../../../shared/constants/request-types.constant.js'
import { Message } from '../../../shared/models/messages.model.js'
import { Client } from '../client.js'
import { serverRouterHandlers } from './server-router.handlers.js'

export const getRequestsWithRouterForServer = (client: Client, eventEmitter: EventEmitter) =>
  client.requests$.pipe(
    filter(({ type }: Message<unknown>) => requestTypesForServer.includes(type)),
    tap((message: Message<unknown>) => {
      const handler = serverRouterHandlers[message.type]
      if (handler) {
        handler({ message, client, eventEmitter })
      }
    }),
    catchError(error => {
      console.warn(error)

      return of(null)
    }),
  )
