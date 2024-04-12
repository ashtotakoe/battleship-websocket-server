import EventEmitter from 'node:events'

import { Client } from '../../core/server/client.js'
import { Message } from '../models/models.js'

export type Clients = Map<number, Client>

export type Handler = (handlerArgs: {
  message: Message<unknown>
  client: Client
  allClients?: Clients
  eventEmitter?: EventEmitter
}) => void

export type Handlers = Record<string, Handler>
