function fetch() {
  const getButtonData = (row, containerName) => {
    const container = row.getElementsByClassName(containerName)[0]
    const buttons = container.getElementsByTagName('button')

    if (buttons.length === 3) return []
    return Array.from(buttons)
  }
  const rows = document.getElementsByClassName(
    'sportEventRow__container___2gQB0'
  )
  const games = []

  for (let row of rows) {
    const teams = Array.from(
      row.getElementsByClassName('__app-LogoTitle-name')
    ).map(el =>
      el.innerText
        .toLowerCase()
        .replace(/\/+/gm, ' ')
        .replace(/\-+/gm, '')
    )

    const [first, second] = getButtonData(
      row,
      '__app-MarketDefault-container'
    ).map(el => parseFloat(el && el.innerText))

    if (!first || !second) {
      continue
    }

    games.push({
      pageIndex: window.pageIndex,
      providerName: window.providerName,
      teams: teams,
      gameName: teams.join(' '),
      bets: { match: { game: { first, second } } }
    })
  }

  return games
}

function fetchPage() {
  const fetchFunctionsByColumnsCount = {
    2: row => {
      const [first, second] = Array.from(
        row.getElementsByTagName('button')
      ).map(el => parseFloat(el.innerText))

      if (!first || !second) return

      return {
        first,
        second
      }
    }
  }

  const teams = Array.from(
    document.getElementsByClassName('TeamHeader__name___3cKcj')
  ).map(el => el.innerText.toLowerCase())
  const rows = Array.from(
    document.getElementsByClassName('__app-TableGroupMarket-table')
  ).filter(row => {
    const title = row
      .getElementsByClassName('marketTable__header___mSHxT')[0]
      .innerText.toLowerCase()

    return window.preferedResults.includes(title)
  })
  const result = {
    pageIndex: window.pageIndex,
    providerName: window.providerName,
    teams,
    gameName: teams.join(' '),
    bets: {}
  }

  for (const row of rows) {
    const mapName = row
      .getElementsByClassName('marketTable__header___mSHxT')[0]
      .innerText.toLowerCase()
    const columnsCount = row.getElementsByClassName(
      'tableColumnNames__column-names___3CXGj'
    )[0].childElementCount

    const game = fetchFunctionsByColumnsCount[columnsCount](row)
    const resultMap = window.maps.find(map => map.names.includes(mapName))

    if (game) {
      result.bets = { ...result.bets, [resultMap.id]: { game } }
    }
  }

  return [result]
}

function open(params) {
  const {
    game: { teams },
    bet,
    betName,
    value
  } = params
  const foundRow = Array.from(
    document.getElementsByClassName('sportEventRow__container___2gQB0')
  ).find(row => {
    const container = row.getElementsByClassName(
      '__app-TeamsTitle-container'
    )[0]

    if (!container) return
    const text = container.innerText
      .toLowerCase()
      .replace(/\/+/gm, ' ')
      .replace(/\-+/gm, '')
    if (text.indexOf(teams[0]) !== -1 && text.indexOf(teams[1] !== -1)) {
      return true
    }
  })

  if (foundRow && betName === 'match') {
    Array.from(
      foundRow
        .getElementsByClassName('__app-MarketDefault-container')[0]
        .getElementsByTagName('button')
    ).map(button => {
      if (parseFloat(button.innerText) === bet) {
        button.click()
      }
    })

    setTimeout(() => {
      window
        .FindReact(
          document.getElementsByClassName('__app-DropDown-input')[0]
            .parentElement
        )
        .props.changeValue(value)
    }, 300)
  }
}

function openPage(params) {
  const { bet, betName, value } = params
  const resultBet = window.maps.find(map => map.id == betName)

  const row = Array.from(
    document.getElementsByClassName('__app-TableGroupMarket-table')
  ).find(row => {
    const title = row
      .getElementsByClassName('marketTable__header___mSHxT')[0]
      .innerText.toLowerCase()

    return resultBet.names.includes(title)
  })

  if (row) {
    Array.from(row.querySelectorAll('[data-analytics-info="bet_add"]')).map(
      button => {
        if (parseFloat(button.innerText) === bet) {
          button.click()
        }
      }
    )

    setTimeout(() => {
      window
        .FindReact(
          document.getElementsByClassName('__app-DropDown-input')[0]
            .parentElement
        )
        .props.changeValue(value)
    }, 300)
  }
}

function close() {
  Array.from(document.querySelectorAll('[title="Удалить ставку"]')).map(
    button => FindReact(button).props.onClick()
  )
}
function auth({ login, password }) {
  const form = document.getElementById('signin-form-social-desk').parentElement
  const loginElement = form.querySelectorAll('[name="_username"]')[0]
  const passwordElement = form.querySelectorAll('[name="_password"]')[0]

  loginElement.value = login
  passwordElement.value = password

  setTimeout(() => {
    $('.btn-success').click()
  }, 500)
}
function dependencies({ pageIndex, providerName }) {
  window.pageIndex = pageIndex
  window.providerName = providerName
  window.maps = [
    {
      id: 'match',
      names: ['winner']
    },
    {
      id: '1',
      names: ['1 map - winner (incl. overtime)', '1 map - winner']
    },
    {
      id: '2',
      names: ['2 map - winner (incl. overtime)', '2 map - winner']
    },
    {
      id: '3',
      names: ['3 map - winner (incl. overtime)', '3 map - winner']
    },
    {
      id: '4',
      names: ['4 map - winner (incl. overtime)', '4 map - winner']
    },
    {
      id: '5',
      names: ['5 map - winner (incl. overtime)', '5 map - winner']
    }
  ]
  window.preferedResults = window.maps
    .map(map => map.names)
    .reduce((acc, value) => acc.concat(value), [])
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
  console.log('dependencies')
}

module.exports = { dependencies, fetch, open, close, auth, fetchPage, openPage }
