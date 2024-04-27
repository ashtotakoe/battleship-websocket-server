import { Events, RequestTypes } from '../../../shared/enums/enums.js'
import { CreateUserData, Message } from '../../../shared/models/messages.model.js'
import { Handlers } from '../../../shared/types/types.js'
import { createPlayer } from '../../../shared/utils/create-player.util.js'
import { wrongPasswordResponse } from '../../../shared/utils/responses.utils.js'
import { db } from '../../db/data-base.js'
import { authorizePlayer } from './router-utils/authorize-player.util.js'

export const serverRouterHandlers: Handlers = {
  [RequestTypes.Registration]: ({ message, client, eventEmitter }) => {
    const { clientState } = client
    const { data } = message as Message<CreateUserData>

    if ((clientState.isAuthorized && clientState.playerData) || !eventEmitter) {
      return
    }

    const player = db.getPlayer(data.name)

    if (!player) {
      const newPlayer = createPlayer(data.name, data.password, clientState.id)
      authorizePlayer(client, newPlayer, eventEmitter)

      return
    }

    if (player.password === data.password) {
      authorizePlayer(client, player, eventEmitter)

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
