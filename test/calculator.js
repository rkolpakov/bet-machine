const Calculator = require('../dist/models/Calculator')

const game = {
  pageIndex: 0,
  providerName: 'pinnacle',
  teams: ['tessah andrianjafitrimo', 'ulrikke eikeri'],
  gameName: 'tessah andrianjafitrimo ulrikke eikeri',
  bets: {
    match: {
      game: { first: 1.5, second: 2.45 },
      handicap: { '4.5': { first: 1.4, second: 2.7 } },
      total: { '29.5': { first: 1.85, second: 1.85 } }
    }
  }
}

const matches = [
  {
    pageIndex: 0,
    providerName: 'fonbet',
    teams: ['andrianjafitrimo t', 'eikeri u'],
    gameName: 'andrianjafitrimo t eikeri u',
    bets: {
      match: {
        game: { first: 1.392, second: 3.18 },
        handicap: { '4.5': { first: 1.456, second: 3.81 } },
        total: { '29.5': { first: 2.12, second: 1.735 } }
      }
    }
  }
]

Calculator.default.calculateGame({ game, matches })
