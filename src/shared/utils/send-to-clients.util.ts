import { Client } from '../../core/server/client.js'

export const sendToClients = (clients: Client[], message: string) => clients.forEach(client => client.send(message))
