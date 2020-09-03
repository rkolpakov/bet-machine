import io from 'socket.io'
import Logger from './Logger'
import { IFork, IConnection } from '../interfaces'

export default class Connection implements IConnection {
  public static getInstance() {
    if (!Connection.instance) {
      Connection.instance = new Connection()
    }
    return Connection.instance
  }
  private static instance: any
  private sockets: any[] = []
  private server: any
  private handlers: any[] = []

  constructor() {
    this.server = io({
      transports: ['websocket']
    }).listen(3001)

    this.server.on('connection', (socket: any) => {
      this.sockets.push(socket)
      this.sockets = this.sockets.filter(socket => !socket.disconnected)

      Logger.logServerInfo('Client connected.')

      if (this.handlers.length) {
        this.handlers.map(({ event, handler }: any) => {
          this.addHandler(event, handler)
        })
      }
      socket.emit('status', true)
    })
  }

  public addHandler(event: string, handler: any) {
    if (!this.handlers.map(h => h.event).includes(event)) {
      this.handlers.push({ event, handler })
    }

    if (this.sockets.length) {
      this.sockets.map(socket => socket.on(event, handler))
      return
    }
  }

  public emit(event: string, data: any) {
    this.sockets.map(socket => socket.emit(event, data))
  }

  public submitForkList(forks: IFork[]) {
    this.emit('forks', JSON.stringify(forks))
  }
}
