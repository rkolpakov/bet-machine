import colors from 'colors'

export default class Logger {
  public static logServerInfo(text: string) {
    console.log(`${colors.yellow.bold('Server:')} ${colors.green(text)}`)
  }
}
