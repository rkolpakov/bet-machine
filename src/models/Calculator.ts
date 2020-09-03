import sim from 'string-similarity'
import { intersection, flatten, sortBy } from 'lodash'
import { IFork, IteratorData, IBet } from '../interfaces'

export default class Calculator {
  public static calculateGameList(iteratorItems: IteratorData[]) {
    return sortBy(
      flatten(
        iteratorItems.map(item => {
          return this.calculateGame(item)
        })
      ),
      ['forkPercentage']
    ).reverse()
  }

  public static calculateMoney(
    forkMultiplier: number,
    betOne: number,
    betTwo: number
  ) {
    const value1 =
      Math.round(global.moneyCount / (forkMultiplier * betOne) / 50) * 50
    const value2 =
      Math.round(global.moneyCount / (forkMultiplier * betTwo) / 50) * 50

    return [value1, value2]
  }

  private static calculateGame({ game, matches }: IteratorData) {
    let resultForks: IFork[] = []

    for (const match of matches) {
      const reversed = this.checkReversed(game.teams, match.teams)
      const intersectedEvent = intersection(
        Object.keys(game.bets),
        Object.keys(match.bets)
      )

      for (const event of intersectedEvent) {
        const gameBets = Object.keys(game.bets[event])
        const matchBets = Object.keys(match.bets[event])
        const intersectedBets = intersection(gameBets, matchBets)

        for (const bet of intersectedBets) {
          const forks: IFork[] = this.calculateBet(
            game.bets[event][bet],
            match.bets[event][bet],
            bet === 'handicap' || bet === 'total' ? false : reversed
          )
          let positiveForks: IFork[] = forks.map(el => ({
            ...el,
            betName: bet,
            matchName: event,
            firstGame: game,
            secondGame: match
          }))

          if (!global.showNegative) {
            positiveForks = positiveForks.filter(el => el.forkPercentage > 1)
          }

          if (positiveForks.length) {
            resultForks = resultForks.concat(positiveForks)
          }
        }
      }
    }

    return resultForks
  }

  private static calculateBet(
    firstBet: IBet,
    secondBet: IBet,
    reversed?: Boolean
  ): IFork[] {
    if (
      firstBet.first &&
      firstBet.second &&
      secondBet.first &&
      secondBet.second
    ) {
      const fork1: IFork = !reversed
        ? this.calculateFork(firstBet.first, secondBet.second)
        : this.calculateFork(firstBet.first, secondBet.first)
      const fork2: IFork = !reversed
        ? this.calculateFork(firstBet.second, secondBet.first)
        : this.calculateFork(firstBet.second, secondBet.second)

      return [fork1, fork2]
    } else {
      const firstSubBet = Object.keys(firstBet)
      const secondSubBet = Object.keys(secondBet)
      const intersectedSubBets = intersection(firstSubBet, secondSubBet)
      let subForks: IFork[] = []

      for (const subBet of intersectedSubBets) {
        const fork: IFork[] = this.calculateBet(
          firstBet[subBet],
          secondBet[subBet],
          reversed
        )
        subForks = subForks.concat(fork)
      }

      return subForks
    }
  }

  private static calculateFork(c1: number, c2: number): IFork {
    const result = 1 / c1 + 1 / c2

    return {
      forkPercentage: (1 - result) * 100,
      forkPure: result,
      firstGameBet: c1,
      secondGameBet: c2
    }
  }

  private static checkReversed(
    gameTeamsFirst: string[],
    gameTeamsSecond: string[]
  ) {
    if (!gameTeamsFirst.length || !gameTeamsSecond.length) {
      return false
    }
    try {
      const arrayOfWords = ['gaming', 'esports']
      const filter = (el: string) => el.length > 1 && !arrayOfWords.includes(el)
      const process = (s: string) => s.split(' ').filter(filter)

      let sTeam0 = process(gameTeamsFirst[0])
      let sTeam3 = process(gameTeamsSecond[1])
      let sTeam1 = process(gameTeamsSecond[0])
      let sTeam2 = process(gameTeamsFirst[1])

      const firstIntersection = intersection(sTeam0, sTeam2)
      const secondIntersection = intersection(sTeam1, sTeam3)

      if (firstIntersection.length) {
        sTeam0 = sTeam0.filter(el => !firstIntersection.includes(el))
        sTeam2 = sTeam2.filter(el => !firstIntersection.includes(el))
      }
      if (secondIntersection.length) {
        sTeam1 = sTeam1.filter(el => !firstIntersection.includes(el))
        sTeam3 = sTeam3.filter(el => !firstIntersection.includes(el))
      }

      if (
        sTeam0.some(
          el => sim.findBestMatch(el, sTeam3).bestMatch.rating > 0.9
        ) ||
        sTeam2.some(el => sim.findBestMatch(el, sTeam1).bestMatch.rating > 0.9)
      ) {
        return true
      }
    } catch (e) {
      return false
    }

    return false
  }
}
