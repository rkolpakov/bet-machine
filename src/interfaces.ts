export interface IBrowser {
  createBrowser(): any
  createPage(url: string): any
  getPages(): any
}

export interface IProvider {
  name: string
  fetchData(): any
  closeCoupon(): any
  openCoupon(f: IFork): void
  updatePageList(): void
  openPageList(): void
}

export interface IStorage {
  set(data: IStorageData): void
  get(): IStorageData
}

export interface IStorageData {
  [s: string]: IGame[]
}

export interface IBet {
  [s: string]:
    | {
        first: number
        second: number
      }
    | any
}

export interface IConnection {
  submitForkList(f: IFork[]): void
  addHandler(action: string, handler: any): void
  emit(action: string, data: any): void
}

export interface IGame {
  providerName: string
  pageIndex: number
  gameName: string
  teams: string[]
  bets: {
    [s: string]: IBet
  }
}

export interface IteratorData {
  game: IGame
  matches: IGame[]
}

export interface IFork {
  forkPercentage: number
  forkPure: number
  firstGameBet: number
  secondGameBet: number
  matchName?: string
  betName?: string
  firstGame?: IGame
  secondGame?: IGame
}

export interface IProviderConfig {
  providerName: string
  urlList: string[]
  account: {
    login: string
    password: string
  }
}
