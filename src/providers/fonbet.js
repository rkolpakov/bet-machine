function fetch() {
  // Uncollapse block
  Array.from(document.getElementsByClassName('_state_collapsed')).map(el =>
    el.click()
  )
  // Uncollapse block

  // Info block
  const infoBarList = Array.from(
    document
      .getElementsByClassName('_type_segment')[0]
      .getElementsByClassName('table__col')
  ).map(el => el.innerText)

  infoBarList.splice(0, 1)
  infoBarList.splice(-1, 1)

  const betList = {
    game: {
      first: infoBarList.findIndex(el => el === '1'),
      second: infoBarList.findIndex(el => el === '2')
    }
  }

  if (infoBarList.includes('Hcap.')) {
    const handicapIndex = infoBarList.findIndex(el => el === 'Hcap.')
    betList.handicap = {
      value: handicapIndex,
      first: handicapIndex + 1,
      second: handicapIndex + 3
    }
  }

  if (infoBarList.includes('Total')) {
    const totalIndex = infoBarList.findIndex(el => el === 'Total')
    betList.total = {
      value: totalIndex,
      first: totalIndex + 1,
      second: totalIndex + 2
    }
  }
  // Info block

  // Bets block
  const rows = Array.from(document.getElementsByClassName('table__row')).filter(
    el =>
      el.className.indexOf('_type_segment') === -1 &&
      el.className.indexOf('_state_blocked') === -1
  )
  let lastTeams
  const games = rows
    .map(row => {
      const titleElement = row.querySelectorAll('h3.table__match-title-text')[0]
      const childElement = row.getElementsByClassName('_is_child')[0]
      const betButtons = Array.from(row.getElementsByClassName('table__col'))
      const bets = {}
      const checkBlocked = (element, className) => {
        return !(element.className.indexOf(className) !== -1)
      }
      let bet = 'match'
      betButtons.splice(0, 2)

      if (titleElement) {
        lastTeams = titleElement.innerText
          .toLowerCase()
          .replace(/\/+/gm, ' ')
          .replace(/\-+/gm, '')
          .split(' — ')
      } else if (childElement) {
        bet = window.maps[childElement.innerText]
      } else {
        return
      }

      Object.keys(betList).forEach(betName => {
        const getButtonData = button => {
          if (button.className.indexOf('_state_active') !== -1) {
            const element = document.getElementsByClassName(
              'v-current--3kf8h'
            )[0]
            if (element) {
              return parseFloat(element.innerText)
            }
          }
          return parseFloat(button.innerText)
        }

        const firstBetElement = betButtons[betList[betName].first]
        const secondBetElement = betButtons[betList[betName].second]

        if (!firstBetElement || !secondBetElement) return
        const firstBet = getButtonData(firstBetElement)
        const secondBet = getButtonData(secondBetElement)
        let resultBet = {
          first: firstBet,
          second: secondBet
        }
        if (betName === 'handicap') {
          const value = parseFloat(
            getButtonData(betButtons[betList[betName].value])
          )
          if (value && value > 0) {
            resultBet = {
              first: secondBet,
              second: firstBet
            }
          }
        }

        if (!checkBlocked(firstBetElement) || !checkBlocked(secondBetElement))
          return
        if (!firstBet || !secondBet) return
        if (!betList[betName].value) {
          bets[betName] = resultBet
        } else {
          const betValue = Math.abs(
            parseFloat(betButtons[betList[betName].value].innerText)
          )

          if (bets[betName]) {
            bets[betName][betValue] = resultBet
          } else {
            bets[betName] = {
              [betValue]: resultBet
            }
          }
        }
      })

      if (Object.keys(bets).length === 0) return null

      return {
        pageIndex: window.pageIndex,
        providerName: window.providerName,
        teams: lastTeams,
        gameName: lastTeams.join(' '),
        bets: {
          [bet || 'trash']: bets
        }
      }
    })
    .filter(Boolean)

  // Bets block

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
  const table = Array.from(document.getElementsByClassName('table__body')).find(
    table =>
      table.innerText
        .toLowerCase()
        .replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
        .indexOf(teams[0]) !== -1 &&
      table.innerText
        .toLowerCase()
        .replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
        .indexOf(teams[1]) !== -1
  )
  const rows = Array.from(table.getElementsByClassName('table__row'))
  const filterIndex = rows.findIndex(
    el =>
      el.innerText
        .toLowerCase()
        .replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
        .indexOf(teams[0]) !== -1 &&
      el.innerText
        .toLowerCase()
        .replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
        .indexOf(teams[1]) !== -1
  )
  rows.splice(0, filterIndex)
  const row = rows.find(
    el =>
      el.innerText
        .toLowerCase()
        .indexOf(window.mapsReversed[betName] || teams[0].toLowerCase()) !== -1
  )

  const button = Array.from(
    (row || table).getElementsByClassName('_type_btn')
  ).find(button => parseFloat(button.innerText) === bet)

  button.click()

  setTimeout(() => {
    const input = document
      .getElementsByClassName('coupons__inner')[0]
      .getElementsByTagName('input')[0]

    const reactElement = window.FindReact(input.parentElement.parentElement)
    reactElement.props.onSetAmount(value)
  }, 100)
}

function close() {
  const button = document.getElementsByClassName(
    'new-coupon__header-clear--74Omv'
  )[0]

  if (button) button.click()
  Array.from(document.getElementsByClassName('stake-clear--1NatC')).map(el =>
    el.click()
  )
}

function auth({ login, password }) {
  document
    .getElementsByClassName('header__login-head')[0]
    .getElementsByTagName('a')[0]
    .click()

  setTimeout(() => {
    const loginForm = document.getElementsByClassName('login-form')[0]
    FindReact(loginForm).setState({ login, password })
    loginForm.getElementsByClassName('toolbar__btn')[0].click()
  }, 100)
}

function dependencies({ pageIndex, providerName }) {
  window.pageIndex = pageIndex
  window.providerName = providerName
  window.maps = {
    '1st set': '1 set',
    '2nd set': '2 set',
    '3rd set': '3 set',
    '1st map': 1,
    '2nd map': 2,
    '3rd map': 3
  }
  window.mapsReversed = {
    match: null,
    '1 set': '1st set',
    '2 set': '2nd set',
    '3 set': '3rd set',
    1: '1st map',
    2: '2nd map',
    3: '3rd map'
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

  document.getElementsByClassName('header__lang-item')[0].click()
  document.getElementsByClassName('header__lang-item')[2].click()
}

module.exports = { dependencies, fetch, open, close, auth }
