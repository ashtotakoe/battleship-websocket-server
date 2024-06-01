import { WSServer } from './core/server/server.js'

console.clear()

const PORT = 3000

const server = new WSServer({ port: PORT })
server.listen()
