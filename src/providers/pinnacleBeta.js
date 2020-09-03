function fetch() {}

function fetchPage() {
  const teams = Array.from(
    document.getElementsByClassName('game-score')[0].getElementsByTagName('p')
  ).map(el => el.innerText.toLowerCase())
  const rows = Array.from(
    document.getElementsByClassName('panel-collapsible-container')
  ).filter(row => {
    const title = row
      .getElementsByClassName('panel-heading')[0]
      .innerText.toLowerCase()
    if (window.preferedResults.includes(title)) return true
  })
  const result = {
    teams,
    gameName: teams.join(' '),
    pageIndex: window.pageIndex,
    providerName: window.providerName,
    bets: {}
  }

  for (const row of rows) {
    const mapName = row
      .getElementsByClassName('panel-heading')[0]
      .innerText.toLowerCase()
    const [first, second] = Array.from(row.querySelectorAll('[ps-odd]')).map(
      el => parseFloat(el.innerText)
    )
    const resultMap = window.maps.find(map => map.names.includes(mapName))

    if (first && second) {
      result.bets = {
        ...result.bets,
        [resultMap.id]: {
          game: {
            first,
            second
          }
        }
      }
    }
  }

  return [result]
}

function open() {}

function openPage(params) {
  const { bet, betName, value } = params
  const resultBet = window.maps.find(map => map.id == betName)
  const row = Array.from(
    document.getElementsByClassName('panel-collapsible-container')
  ).find(row => {
    const title = row
      .getElementsByClassName('panel-heading')[0]
      .innerText.toLowerCase()
    return resultBet.names.includes(title)
  })

  if (row) {
    Array.from(row.querySelectorAll('[ps-odd]')).map(button => {
      if (parseFloat(button.innerText) === bet) {
        button.parentElement.click()
      }
    })
    setTimeout(() => {
      const input = document.getElementById('stake-field')

      input.value = value
      input.dispatchEvent(new Event('change'))
    }, 500)
  }
}

function close() {
  Array.from(document.querySelectorAll('[ng-click="deleteWager()"]')).map(el =>
    el.click()
  )
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
  window.maps = [
    {
      id: 'match',
      names: ['match odds - match', 'money line - match']
    },
    {
      id: 1,
      names: ['money line - map 1', 'match odds - 1st set winner']
    },
    {
      id: 2,
      names: ['money line - map 2', 'match odds - 2nd set winner']
    },
    {
      id: 3,
      names: ['money line - map 3', 'match odds - 3rd set winner']
    },
    {
      id: 4,
      names: ['money line - map 4', 'match odds - 4th set winner']
    },
    {
      id: 5,
      names: ['money line - map 5', 'match odds - 5th set winner']
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
}

module.exports = { dependencies, fetch, open, close, auth, fetchPage, openPage }
