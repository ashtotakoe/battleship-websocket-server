import { Client } from '../../core/server/client.js'
import { Player } from '../models/models.js'
import { createWsResponse } from './create-ws-response.util.js'


export const userIsAuthorizedResponse = (client: Client, player: Player) => client.send(
  createWsResponse('reg', {
    name: player.name,
    index: player.index,
    error: false,
    errorText: '',
  })
)
