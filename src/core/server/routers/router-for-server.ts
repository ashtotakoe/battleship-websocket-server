import { filter, tap } from 'rxjs'

import { requestTypesForServer } from '../../../shared/constants/request-types.js'
import { CreateUserData, Message } from '../../../shared/models/models.js'
import { Handler } from '../../../shared/types/types.js'
import { createWsResponse } from '../../../shared/utils/create-ws-response.util.js'
import { createPlayer } from '../../../shared/utils/create-player.util.js'
import { userIsAuthorizedResponse } from '../../../shared/utils/responses.js'
import { db } from '../../db/data-base.js'
import { Client } from '../client.js'

const handlers: Record<string, Handler> = {
  reg: ({ message, client }) => {
    if (client.clientState.isAuthorized && client.clientState.player) {
      return
    }

    const { data } = message as Message<CreateUserData>

    const player = db.getPlayer(data.name)

    if (!player) {
      const newPlayer = createPlayer(data.name, data.password)
      client.clientState.isAuthorized = true
      client.clientState.player = newPlayer

      userIsAuthorizedResponse(client, newPlayer)
      return
    }

    if (player.password === data.password) {
      client.clientState.isAuthorized = true
      client.clientState.player = player

      userIsAuthorizedResponse(client, player)
      return
    }

    client.send(
      createWsResponse('reg', {
        error: true,
        errorText: 'Wrong password',
      }),
    )
  },

  create_room: () => {console.log('huy')},
}

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
