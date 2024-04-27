import EventEmitter from 'node:events'

import { Events } from '../../../../shared/enums/enums.js'
import { Player } from '../../../../shared/models/models.js'
import { userIsAuthorizedResponse } from '../../../../shared/utils/responses.utils.js'
import { Client } from '../../client.js'

export const authorizePlayer = (client: Client, player: Player, eventEmitter: EventEmitter) => {
  const { clientState } = client

  clientState.isAuthorized = true
  clientState.playerData = player

  client.send(userIsAuthorizedResponse(clientState.playerData))
  eventEmitter.emit(Events.SyncWinnersAndRoomsForClient, client)
}
