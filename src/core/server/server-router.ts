import EventEmitter from 'node:events'
import { catchError, filter, of, tap } from 'rxjs'

import { requestTypesForServer } from '../../shared/constants/request-types.js'
import { Events, RequestTypes } from '../../shared/enums/enums.js'
import { CreateUserData, Message } from '../../shared/models/messages.model.js'
import { Player } from '../../shared/models/models.js'
import { Handlers } from '../../shared/types/types.js'
import { createPlayer } from '../../shared/utils/create-player.util.js'
import { userIsAuthorizedResponse, wrongPasswordResponse } from '../../shared/utils/responses.utils.js'
import { db } from '../db/data-base.js'
import { Client } from './client.js'

const sendRegistrationSuccessfulResponse = (client: Client, player: Player, eventEmitter: EventEmitter) => {
  const { clientState } = client

  clientState.isAuthorized = true
  clientState.playerData = player

  client.send(userIsAuthorizedResponse(player))
  eventEmitter.emit(Events.SyncWinnersAndRoomsForClient, client)
}

const handlers: Handlers = {
  [RequestTypes.Registration]: ({ message, client, eventEmitter }) => {
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

  [RequestTypes.CreateRoom]: ({ eventEmitter }) => {
    eventEmitter?.emit(Events.CreateRoom)
  },

  [RequestTypes.AddUserToRoom]: ({ message, client, eventEmitter }) => {
    const { data } = message as Message<{ indexRoom: number }>

    eventEmitter?.emit(Events.AddUserToRoom, client, data.indexRoom)
  },
}

export const getRequestsWithRouterForServer = (client: Client, eventEmitter: EventEmitter) =>
  client.requests$.pipe(
    filter(({ type }: Message<unknown>) => requestTypesForServer.includes(type)),
    tap((message: Message<unknown>) => {
      const handler = handlers[message.type]
      if (handler) {
        handler({ message, client, eventEmitter })
      }
    }),
    catchError(error => {
      console.warn(error)

      return of(null)
    }),
  )
