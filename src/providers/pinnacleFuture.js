function fetch() {
  const getButtonData = button => {
    if (!button) return null
    const pointsElement = button.getElementsByClassName('points')[0]
    let priceElement = button.getElementsByClassName('price')[0]

    if (button.getAttribute('data-selected') === 'true') {
      const element = document.querySelectorAll(
        '[data-test-id="SelectionDetails-Odds"]'
      )[0]

      if (element) priceElement = element
    }

    if (!priceElement) return null
    return {
      price: parseFloat(priceElement.innerText),
      isNegative: pointsElement
        ? parseFloat(pointsElement.innerText) < 0
        : null,
      points: pointsElement
        ? Math.abs(parseFloat(pointsElement.innerText))
        : null
    }
  }
  // Info block
  const infoBarList = document
    .querySelectorAll('[data-test-id="Event.SeparationBar"]')[0]
    .innerText.split('\n')
    .map(el => el.toLowerCase())
    .filter(el => el !== 'under')
    .map(el => (el === 'over' ? 'total' : el))
  infoBarList.splice(0, 1)
  // Info block

  const games = Array.from(
    document.querySelectorAll('[data-test-id="Event.Row"]')
  )
    .map(game => {
      // Team name block
      const teamRaw = Array.from(game.querySelectorAll('span[alt]')).map(
        el => el.innerText
      )
      const mapNames = Object.keys(maps)
      const matchName = mapNames.find(mapName => {
        if (teamRaw[0].toLowerCase().indexOf(mapName.toLowerCase()) !== -1) {
          return true
        }
        return false
      })
      if (maps[matchName] === 'trash') return null
      const teams = teamRaw
        .map(el => el.split(' (')[0].toLowerCase())
        .map(team => team.replace(/ Game \d of Set \d/gm, ''))
        .map(team => team.replace(new RegExp(matchName || '', 'gi'), '').trim())
      // Team name block

      // Bet block
      const betButtons = Array.from(
        game.querySelectorAll('[data-test-id="Event.MarketBtn"]')
      )
      const bets = {}
      const getBetIndex = n => [2 * n - 2, 2 * n - 1]

      infoBarList.forEach((betName, index) => {
        const [first, second] = getBetIndex(index + 1)
        const firstButtonData = getButtonData(betButtons[first])
        const secondButtonData = getButtonData(betButtons[second])
        if (!firstButtonData || !secondButtonData) return
        if (!firstButtonData.price || !secondButtonData.price) return
        let bet = {
          first: firstButtonData.price,
          second: secondButtonData.price
        }

        if (
          betName.toLowerCase() === 'handicap' &&
          secondButtonData.isNegative === true
        ) {
          bet = {
            first: secondButtonData.price,
            second: firstButtonData.price
          }
        }

        if (betName.toLowerCase() === 'moneyline') {
          bets['game'] = bet
        } else {
          bets[betName] = { [firstButtonData.points]: bet }
        }
      })
      // Bet block

      if (Object.keys(bets).length === 0) return

      return {
        pageIndex: window.pageIndex,
        providerName: window.providerName,
        teams,
        gameName: teams.join(' '),
        bets: {
          [window.maps[matchName] || 'match']: bets
        }
      }
    })
    .filter(Boolean)

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
  try {
    let el
    const { bet, game, betName } = params
    const games = Array.from(
      document.querySelectorAll('[data-test-id="Event.Row"]')
    )
    const currentGames = games.filter(g => {
      const gameInner = g.innerText.toLowerCase()
      return (
        gameInner.indexOf(game.teams[0].toLowerCase()) !== -1 &&
        gameInner.indexOf(game.teams[1].toLowerCase()) !== -1
        // gameInner.indexOf(window.maps[betName].toLowerCase()) !== -1
      )
    })

    currentGames.find(g => {
      const buttonArray = Array.from(
        g.querySelectorAll('[data-test-id="Event.MarketBtn"]')
      )
      console.log(buttonArray, bet)
      el = buttonArray.find(
        el =>
          parseFloat(el.getElementsByClassName('price')[0].innerText) === bet
      )
      return el
    })
    el.click()

    // const waitInterval = setInterval(() => {
    //   if (
    //     document.querySelectorAll('[data-test-id="Betslip-StakeWinInput"]')
    //       .length
    //   ) {
    //     clearInterval(waitInterval)

    //     const input = document
    //       .querySelectorAll('[data-test-id="Betslip-StakeWinInput"]')[0]
    //       .getElementsByTagName('input')[0]
    //     const reactElement = window.FindReact(input.parentElement)
    //     reactElement.props.onChange(value)
    //     reactElement.setState({ value })
    //   }
    // }, 100)
  } catch (e) {
    console.log(e)
    return e
  }
}

function close() {
  const tickets = Array.from(
    document.querySelectorAll('[data-test-id="Betslip-SelectionDetails"]')
  )

  if (tickets.length) {
    tickets.map(ticket => {
      const closeButton = ticket.getElementsByClassName('icon-x')[0]
        .parentElement

      closeButton.click()
    })
  }
}

function auth({ login, password }) {
  const usernameEl = document.getElementById('username')
  const passwordEl = document.getElementById('password')
  const button = document.querySelectorAll(
    '[data-test-id="header-login-loginButton"]'
  )[0]

  if (usernameEl && passwordEl) {
    window.FindReact(usernameEl).props.onChange({
      persist: () => {},
      target: { value: login, id: 'username' }
    })
    window.FindReact(passwordEl).props.onChange({
      persist: () => {},
      target: { value: password, id: 'password' }
    })
    window.FindReact(button).submit()

    setTimeout(() => {
      window.location.href = window.location.href
    }, 5000)
  }
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

module.exports = { dependencies, fetch, open, close, auth }
