import EventEmitter from 'node:events'

import { Events } from '../../../../shared/enums/enums.js'
import { Player } from '../../../../shared/models/models.js'
import { userIsAuthorizedResponse } from '../../../../shared/utils/responses.utils.js'
import { Client } from '../../client.js'

export const authorizePlayer = (client: Client, player: Player, eventEmitter: EventEmitter) => {
  client.clientState = {
    ...client.clientState,

    isAuthorized: true,
    playerData: player,
    id: player.index,
  }

  client.send(userIsAuthorizedResponse(player))
  eventEmitter.emit(Events.SyncWinnersAndRoomsForClient, client)
}
