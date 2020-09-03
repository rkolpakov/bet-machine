import sim from 'string-similarity'
import Calculator from './Calculator'
import {
  IStorage,
  IGame,
  IteratorData,
  IProvider,
  IStorageData
} from '../interfaces'

const arrayOfWords = ['gaming', 'esports']

export default class Iterator {
  private storage: IStorage
  private connection: any
  private iterationDelay: number = global.iterationDelay

  constructor(storage: IStorage, connection: any) {
    this.storage = storage
    this.connection = connection
  }

  public createFetchIterator(providerList: IProvider[]): void {
    setInterval(async () => {
      const response = (await Promise.all(
        providerList.map(async (provider: IProvider) => {
          const data: IGame[] = await provider.fetchData()
          return [data, provider.name]
        })
      )).reduce((result: any, [data, name]: any) => {
        result[name] = data
        return result
      }, {})

      this.storage.set(response)
    }, this.iterationDelay)
  }

  public async createFetchListIterator() {
    setInterval(async () => {
      const storage: IStorageData = this.storage.get()
      const providers = Object.keys(storage)
      const providerGamesList: IGame[][] = providers.map(
        provider => storage[provider]
      )
      let resultArrayOfMatchedGames: IteratorData[] = []

      providerGamesList.forEach((providerGames: IGame[], index: number) => {
        if (index === providerGamesList.length - 1) {
          return
        }
        const gameResults: IteratorData[] = []

        providerGames.forEach((game: IGame) => {
          const teams = game.teams.map(team =>
            team
              .split(' ')
              .filter(s => s.length > 1 || !arrayOfWords.includes(s))
              .join(' ')
          )
          const gamesListToSearch: IGame[][] = providerGamesList.slice(
            index + 1
          )
          const matches: IGame[] = []

          for (const games of gamesListToSearch) {
            // tslint:disable-next-line:no-shadowed-variable
            for (const game of games) {
              const gameTeams = game.teams.filter(
                s => !arrayOfWords.includes(s)
              )
              const first = sim.findBestMatch(teams[0], gameTeams)
              const second = sim.findBestMatch(teams[1], gameTeams)

              if (
                first.bestMatch.rating > global.precision &&
                second.bestMatch.rating > global.precision
              ) {
                matches.push(game)
              }
            }
          }
          // END
          if (matches.length) {
            gameResults.push({ game, matches })
          }
        })

        if (gameResults.length) {
          resultArrayOfMatchedGames = resultArrayOfMatchedGames.concat(
            gameResults
          )
        }
      })

      this.connection.submitForkList(
        Calculator.calculateGameList(resultArrayOfMatchedGames)
      )
    }, this.iterationDelay)
  }
}
