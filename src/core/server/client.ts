import { BehaviorSubject, Observable, Subject } from 'rxjs'
import WebSocket from 'ws'

import { Message } from '../../shared/models/messages.model.js'
import { ClientState } from '../../shared/models/models.js'

export class Client {
  private readonly socket: WebSocket
  private readonly requests$$ = new Subject<Message<unknown>>()
  private readonly state$$: BehaviorSubject<ClientState>

  public readonly requests$: Observable<Message<unknown>> = this.requests$$.asObservable()
  public readonly state$: Observable<ClientState>

  constructor(socket: WebSocket, id: number) {
    this.socket = socket

    this.state$$ = new BehaviorSubject({ id })

    this.state$ = this.state$$.asObservable()

    this.listen()
  }

  public get clientState() {
    return this.state$$.value
  }

  public send(data: string) {
    this.socket.send(data)
  }

  public setState(state: ClientState) {
    this.state$$.next(state)
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
