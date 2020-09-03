import { argv } from 'yargs'
import Provider from './models/Provider'
import Connection from './models/Connection'
import Storage from './models/Storage'
import Iterator from './models/Iterator'
import Logger from './models/Logger'
import config from './config.json'
import { IFork } from './interfaces'

global.iterationDelay = argv.iterationDelay as number
global.moneyCount = 5000
global.showNegative = false
global.precision = 0.7

async function app() {
  const { providers: providerConfigs } = config
  const storage = new Storage()
  const connection = Connection.getInstance()
  const iterator = new Iterator(storage, connection)

  Logger.logServerInfo('Starting backend...')
  const providers = await Provider.createProviderList(providerConfigs)
  Logger.logServerInfo('All browsers started!')

  iterator.createFetchIterator(providers)
  iterator.createFetchListIterator()

  connection.addHandler('exit', () => process.exit())
  connection.addHandler('close', () => {
    providers.map(provider => provider.closeCoupon())
  })
  connection.addHandler('select', (fork: IFork) => {
    const { firstGame, secondGame } = fork

    if (firstGame && secondGame) {
      providers.map(provider => {
        if (
          provider.name === firstGame.providerName ||
          provider.name === secondGame.providerName
        ) {
          provider.openCoupon(fork)
        }
      })
    }
  })
  connection.addHandler('changeMoney', (moneyCount: number) => {
    global.moneyCount = moneyCount
  })
  connection.addHandler('setNegative', (showNegative: boolean) => {
    global.showNegative = showNegative
  })
  connection.addHandler('updateProviderPageList', () => {
    providers.map(provider => provider.updatePageList())
  })
  connection.addHandler('updatePrecision', (value: number) => {
    global.precision = value
  })
}

app()
