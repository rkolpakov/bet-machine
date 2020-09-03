import Browser from './Browser'
import Logger from './Logger'
import Calculator from './Calculator'
import { IBrowser, IProvider, IProviderConfig, IFork } from '../interfaces'
import { flatten } from 'lodash'

export default class Provider implements IProvider {
  public static async createProviderList(providers: IProviderConfig[]) {
    const providerList: IProvider[] = []
    for (const providerConfig of providers) {
      const provider: IProvider = new Provider(providerConfig)
      await provider.openPageList()
      providerList.push(provider)
    }
    return providerList
  }

  public name: string
  private authUrl: string
  private isSingleEvent: Boolean
  private browser: IBrowser
  private urlList: string[]
  private methods: any
  private pageList: any = []
  private account: { login: string; password: string }

  constructor(config: any) {
    this.urlList = config.urlList
    this.name = config.providerName
    this.account = config.account
    this.authUrl = config.authUrl
    this.isSingleEvent = config.isSingleEvent
    this.browser = new Browser()
    this.methods = require(`../providers/${this.name}.js`)
  }

  public async updatePageList() {
    this.pageList = await this.browser.getPages()
    console.log('pageListUpdated')
  }

  public async fetchData() {
    const response = await this.executeProviderMethod(
      this.isSingleEvent ? 'fetchPage' : 'fetch'
    )
    return flatten(response)
  }

  public async openCoupon(fork: IFork) {
    this.methods = require(`../providers/${this.name}.js`)
    const {
      firstGameBet,
      secondGameBet,
      firstGame,
      secondGame,
      matchName,
      forkPure
    } = fork
    let currentProviderGame
    let bet
    let value

    const [value1, value2] = Calculator.calculateMoney(
      forkPure,
      firstGameBet,
      secondGameBet
    )

    if (firstGame && firstGame.providerName === this.name) {
      currentProviderGame = firstGame
      bet = firstGameBet
      value = value1
    } else if (secondGame && secondGame.providerName === this.name) {
      currentProviderGame = secondGame
      bet = secondGameBet
      value = value2
    }

    if (currentProviderGame && bet) {
      await this.pageList[currentProviderGame.pageIndex].bringToFront()
      this.executeProviderMethod(
        this.isSingleEvent ? 'openPage' : 'open',
        {
          bet,
          value,
          betName: matchName,
          game: { teams: currentProviderGame.teams }
        },
        currentProviderGame.pageIndex
      )
    }
  }

  public async closeCoupon() {
    return this.executeProviderMethod('close')
  }

  public async openPageList() {
    let isLogged = false
    let index = 0
    for (const url of this.urlList) {
      const page = await this.browser.createPage(url)
      if (!isLogged) {
        if (this.authUrl) {
          await page.goto(this.authUrl)
        }
        await new Promise(function(resolve) {
          setTimeout(resolve, 5000)
        })
        await this.loadDependencies(page, index)
        await page.evaluate(this.methods.auth, this.account)
        await new Promise(function(resolve) {
          setTimeout(resolve, 10000)
        })
        if (this.authUrl) {
          await page.goto(url)
        }
        isLogged = true
      }
      this.pageList.push(page)
      index++
    }
  }

  private async loadDependencies(page: any, pageIndex: number) {
    const { dependencies } = this.methods

    await page.evaluate(dependencies, {
      providerName: this.name,
      pageIndex
    })
  }

  private async executeProviderMethod(
    method: string,
    data?: any,
    pageNumber?: number
  ) {
    const methodImp = this.methods[method]

    if (pageNumber) {
      return this.pageList[pageNumber]
        .evaluate(methodImp, data)
        .catch((e: any) => {
          Logger.logServerInfo(
            `Error while execution ${method} method inside ${pageNumber +
              1} page on ${this.name} provider`
          )
          console.error(e)
        })
    }

    const response: any = await Promise.all(
      this.pageList.map(async (page: any, index: number) => {
        await this.loadDependencies(page, index)
        let response = []
        try {
          response = await page.evaluate(methodImp, data)
        } catch (e) {
          Logger.logServerInfo(`ERROR while ${method} executing`)
        }
        return response
      })
    )

    return response
  }
}
