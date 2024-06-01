import { BehaviorSubject } from 'rxjs'

import { Clients } from '../../shared/types/types.js'
import { Client } from './client.js'

export class ActiveClientsManager {
  private activeClients: Clients = new Map()
  private activeClients$$ = new BehaviorSubject<Clients>(this.activeClients)

  public activeClients$ = this.activeClients$$.asObservable()

  public setNewActiveClient(client: Client) {
    this.activeClients.set(client.clientState.id, client)

    this.activeClients$$.next(this.activeClients)
  }
  public removeFromActiveClients(client: Client) {
    this.activeClients.delete(client.clientState.id)

    this.activeClients$$.next(this.activeClients)
  }
}
