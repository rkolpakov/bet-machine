import { launch } from 'puppeteer'
import { IBrowser } from '../interfaces'

function createDefaultArgs(width: number, height: number): string[] {
  return [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    `--window-size=${width},${height}`
  ]
}

export default class Browser implements IBrowser {
  private headless: boolean
  private args: string[]
  private width: number = 1680
  private height: number = 950
  private timeout: number = 100000
  private browser: any = null

  constructor(headless?: boolean, args?: string[]) {
    this.headless = headless || false
    this.args = args || createDefaultArgs(this.width, this.height)
  }

  public async createBrowser() {
    this.browser = await launch({
      args: this.args,
      headless: this.headless
    })
    await (await this.browser.pages())[0].close()
  }

  public async createPage(url: string) {
    if (!this.browser) {
      await this.createBrowser()
    }

    const page: any = await this.browser.newPage()
    await page.setViewport({ width: this.width, height: this.height })
    await page.goto(url, { timeout: this.timeout })

    return page
  }

  public async getPages() {
    const pages = await this.browser.pages()
    return Promise.all(
      pages.map(async (page: any) => {
        await page.setViewport({ width: this.width, height: this.height })
        return page
      })
    )
  }
}
