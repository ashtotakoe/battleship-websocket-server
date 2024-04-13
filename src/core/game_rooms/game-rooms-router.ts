import { filter, tap } from 'rxjs'

import { requestTypesForServer } from '../../shared/constants/request-types.js'
import { Message } from '../../shared/models/models.js'
import { Handlers } from '../../shared/types/types.js'
import { Client } from '../server/client.js'

const handlers: Handlers = {}

export const getRequestsWithRouterForServer = (client: Client) =>
  client.requests$.pipe(
    filter(({ type }: Message<unknown>) => requestTypesForServer.includes(type)),
    tap((message: Message<unknown>) => {
      const handler = handlers[message.type]
      if (handler) {
        handler({ message, client })
      }
    }),
  )
