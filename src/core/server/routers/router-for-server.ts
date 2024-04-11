import EventEmitter from 'node:events'
import { filter, tap } from 'rxjs'

import { requestTypesForServer } from '../../../shared/constants/request-types.js'
import { Events } from '../../../shared/enums/enums.js'
import { CreateUserData, Message, Player } from '../../../shared/models/models.js'
import { Handler } from '../../../shared/types/types.js'
import { createPlayer } from '../../../shared/utils/create-player.util.js'
import { userIsAuthorizedResponse, wrongPasswordResponse } from '../../../shared/utils/responses.js'
import { db } from '../../db/data-base.js'
import { Client } from '../client.js'

const sendRegistrationSuccessfulResponse = (client: Client, player: Player, eventEmitter: EventEmitter) => {
  const { clientState } = client

  clientState.isAuthorized = true
  clientState.playerData = player

  client.send(userIsAuthorizedResponse(player))
  eventEmitter.emit(Events.SYNC_WINNERS_AND_ROOMS_FOR_CLIENT, client)
}

const handlers: Record<string, Handler> = {
  reg: ({ message, client, eventEmitter }) => {
    const { clientState } = client

    if ((clientState.isAuthorized && clientState.playerData) || !eventEmitter) {
      return
    }

    const { data } = message as Message<CreateUserData>

    const player = db.getPlayer(data.name)

    if (!player) {
      const newPlayer = createPlayer(data.name, data.password, clientState.id)
      sendRegistrationSuccessfulResponse(client, newPlayer, eventEmitter)
      return
    }

    if (player.password === data.password) {
      sendRegistrationSuccessfulResponse(client, player, eventEmitter)

      return
    }

    client.send(wrongPasswordResponse())
  },

  create_room: ({ eventEmitter }) => {
    eventEmitter?.emit(Events.CREATE_ROOM)
  },
  add_user_to_room: ({ message, client, eventEmitter }) => {
    const { data } = message as Message<{ indexRoom: number }>

    eventEmitter?.emit(Events.ADD_USER_TO_ROOM, client, data.indexRoom)
  },
}

export const getRequestsWithRouterForServer = (client: Client, eventEmitter: EventEmitter) =>
  client.requests$.pipe(
    tap(console.log),
    filter(({ type }: Message<unknown>) => requestTypesForServer.includes(type)),
    tap((message: Message<unknown>) => {
      const handler = handlers[message.type]
      if (handler) {
        handler({ message, client, eventEmitter })
      }
    }),
  )
