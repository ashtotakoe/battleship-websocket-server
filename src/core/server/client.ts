import { BehaviorSubject, map, Observable, Subject } from 'rxjs'
import WebSocket from 'ws'

import { Message } from '../../shared/models/messages.model.js'
import { ClientState, Player } from '../../shared/models/models.js'

export class Client {
  private readonly requests$$ = new Subject<Message<unknown>>()
  private readonly state$$: BehaviorSubject<ClientState>

  public readonly requests$: Observable<Message<unknown>> = this.requests$$.asObservable()
  public readonly playerData$: Observable<Player | null>

  constructor(
    private readonly socket: WebSocket,
    id: number,
  ) {
    this.state$$ = new BehaviorSubject({ id })

    this.playerData$ = this.state$$.asObservable().pipe(map(client => client.playerData ?? null))

    this.listen()
  }

  public get clientState() {
    return this.state$$.value
  }

  public set clientState(clientState: ClientState) {
    this.state$$.next(clientState)
  }

  public playerWon() {
    const { playerData } = this.clientState
    if (!playerData) return

    playerData.numberOfWins++

    this.state$$.next(Object.assign(this.clientState, { playerData }))
  }

  public send(data: string) {
    this.socket.send(data)
  }

  public destroy() {
    this.requests$$.complete()
    this.socket.close()
  }

  private listen() {
    this.socket.on('message', data => {
      const req = JSON.parse(data.toString())
      if (req.data !== '') {
        req.data = JSON.parse(req.data)
      }
      this.requests$$.next(req as Message<unknown>)
    })

    this.socket.on('close', () => this.requests$$.complete())
  }
}
