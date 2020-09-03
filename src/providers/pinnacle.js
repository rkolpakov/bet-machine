function fetch() {
  const lineBlock = document.getElementById('lines')
  const rows = lineBlock.getElementsByClassName('evRow')
  const loadMore = document.getElementById('loadMoreGamesLink')
  const mapNames = Object.keys(window.maps)
  const games = []

  if (loadMore) loadMore.click()

  const getEvent = (element, pointsClass, [firstClass, secondClass] = []) => {
    const first = element.getElementsByClassName(firstClass || 'Home')[0]
    const second = element.getElementsByClassName(secondClass || 'Away')[0]

    if (!first || !second) return
    const bet = {
      first: parseFloat(first.innerText),
      second: parseFloat(second.innerText)
    }
    if (Number.isNaN(bet.first) || Number.isNaN(bet.second)) return

    const firstPointsElement = element.getElementsByClassName(pointsClass)[0]
    const secondPointsElement = element.getElementsByClassName(pointsClass)[1]

    if (firstPointsElement || secondPointsElement) {
      const firstPoints =
        firstPointsElement && parseFloat(firstPointsElement.innerText)
      const secondPoints =
        secondPointsElement && parseFloat(secondPointsElement.innerText)

      if (firstPoints) {
        return { [firstPoints]: bet }
      }
      if (secondPoints) {
        return {
          [secondPoints]: {
            first: parseFloat(second.innerText),
            second: parseFloat(first.innerText)
          }
        }
      }
    }

    return bet
  }

  // Click to all refresh buttons
  Array.from(document.getElementsByClassName('rfsh')).map(el => el.click())

  for (const row of rows) {
    const teamsWrapper = row.getElementsByClassName('teamId')[0]
    let teams = [
      teamsWrapper
        .getElementsByClassName('Home')[0]
        .innerText.replace(/\/+/gm, ' ')
        .replace(/\-+/gm, ''),
      teamsWrapper
        .getElementsByClassName('Away')[0]
        .innerText.replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
    ]
    const matchName = mapNames.find(mapName => {
      if (teams[0].toLowerCase().indexOf(mapName.toLowerCase()) !== -1) {
        return true
      }
      return false
    })
    teams = teams
      .map(team => team.replace(/ Game \d of Set \d/gm, ''))
      .map(team => team.replace(new RegExp(matchName || '', 'gi'), '').trim())
      .map(el => el.toLowerCase())

    const bets = {
      [window.maps[matchName] || 'match']: {
        game: getEvent(row.getElementsByClassName('moneyline')[0]),
        handicap: getEvent(row.getElementsByClassName('spread')[0], 'Handicap'),
        total: getEvent(row.getElementsByClassName('total')[0], 'Handicap', [
          'Over',
          'Under'
        ])
      }
    }

    games.push({
      pageIndex: window.pageIndex,
      providerName: window.providerName,
      teams,
      gameName: teams.join(' '),
      bets
    })
  }

  const result = {}
  games.map(currentGame => {
    if (result[currentGame.gameName]) {
      result[currentGame.gameName].bets = {
        ...result[currentGame.gameName].bets,
        ...currentGame.bets
      }
    } else {
      result[currentGame.gameName] = currentGame
    }
  })

  return Object.values(result)
}

function open(params) {
  const {
    game: { teams },
    bet,
    betName,
    value
  } = params

  console.log(JSON.stringify(params))

  const findBetButton = (row, b) =>
    Array.from(row.getElementsByClassName('pos0')).find(
      button => button.innerText == b
    )
  const rows = Array.from(document.getElementsByClassName('evRow'))
  const resultRow = rows.find(row => {
    const teamText = row
      .getElementsByClassName('teamId')[0]
      .innerText.toLowerCase()
      .replace(/\/+/gm, ' ')
      .replace(/\-+/gm, '')

    const rowFound =
      teamText.indexOf(teams[0]) !== -1 &&
      teamText.indexOf(teams[1]) !== -1 &&
      (betName !== 'match'
        ? teamText.indexOf(window.mapsReversed[betName].toLowerCase()) !== -1
        : true)

    if (rowFound && findBetButton(row, bet)) {
      return true
    }
    return false
  })

  if (resultRow) {
    const button = findBetButton(resultRow, bet)

    if (button) {
      button.getElementsByClassName('wLnk')[0].click()

      setTimeout(() => {
        document.getElementById(
          'PendingTicket_TicketItem_StakeAmount'
        ).value = value
      }, 300)
    }
  }
}

function close() {
  document.getElementById('ticketClear').click()
}

function auth({ login, password }) {
  window
    .FindReact(document.querySelectorAll('[name="username"]')[0])
    .props.onChange({
      target: { value: login }
    })
  window
    .FindReact(document.querySelectorAll('[name="password"]')[0])
    .props.onChange({
      target: { value: password }
    })
  setTimeout(() => {
    alert('Click submit!')
    document.querySelectorAll('[data-test-id="Button"]')[0].click()
  }, 500)
}

function dependencies({ pageIndex, providerName }) {
  window.pageIndex = pageIndex
  window.providerName = providerName
  window.maps = {
    'Map 1': 1,
    'Map 2': 2,
    'Map 3': 3,
    'Map 4': 4,
    'Map 5': 5,
    Match: 'match',
    'of Set': 'trash',
    Kills: 'trash',
    'To Win Set 1': '1 set',
    'To Win Set 2': '2 set',
    'To Win Set 3': '3 set',
    'To Win Set 4': '4 set',
    'To Win Set 5': '5 set',
    'To Win Set 6': '6 set',
    ' Sets': 'trash2'
  }
  window.mapsReversed = {
    1: 'Map 1',
    2: 'Map 2',
    3: 'Map 3',
    4: 'Map 4',
    5: 'Map 5',
    match: '',
    '1 set': 'To Win Set 1',
    '2 set': 'To Win Set 2',
    '3 set': 'To Win Set 3',
    '4 set': 'To Win Set 4',
    '5 set': 'To Win Set 5',
    '6 set': 'To Win Set 6'
  }
  window.FindReact = function(dom) {
    let key = Object.keys(dom).find(key =>
      key.startsWith('__reactInternalInstance$')
    )
    let internalInstance = dom[key]
    if (internalInstance == null) return null

    if (internalInstance.return) {
      return internalInstance._debugOwner
        ? internalInstance._debugOwner.stateNode
        : internalInstance.return.stateNode
    } else {
      return internalInstance._currentElement._owner._instance
    }
  }
}

module.exports = { dependencies, fetch, open, close, auth }
