const { ipcRenderer } = require('electron')
const socket = io('http://localhost:3001', { transports: ['websocket'] })

const app = new Vue({
  el: '#app',

  data: {
    forks: [],
    money: '5000',
    speed: '1000',
    showNegative: false,
    appStarted: false,
    precision: 0.7
  },

  mounted() {
    socket.on('forks', forks => {
      this.forks = JSON.parse(forks).map(el => {
        const p = el.forkPercentage
        return {
          ...el,
          isSuccess: p >= 5,
          isPrimary: p > 3 && p < 5,
          isInfo: p < 3 && p > 0,
          isNegative: p < 0
        }
      })
      if (!this.appStarted) {
        this.appStarted = true
      }
    })

    socket.on('status', value => {
      this.appStarted = true
    })

    document.getElementById('spinner').style.display = 'none'
    document.getElementById('app').style.display = 'block'
  },

  watch: {
    showNegative(showNegative) {
      socket.emit('setNegative', showNegative || false)
    }
  },

  methods: {
    launch() {
      if (!this.appStarted) {
        ipcRenderer.send('start', true)
        this.appStarted = true
      } else {
        ipcRenderer.send('stop', true)
        this.appStarted = false
      }
    },
    select(fork) {
      socket.emit('select', fork)
      console.log(socket)
    },
    changeMoney() {
      socket.emit('changeMoney', parseInt(this.money) || 5000)
    },
    updatePageList() {
      socket.emit('updateProviderPageList', true)
    },
    changeSpeed() {
      ipcRenderer.send('changeSpeed', parseInt(this.speed) || 1000)
    },
    closeCoupons() {
      socket.emit('close', true)
    },
    updatePrecision() {
      socket.emit('updatePrecision', parseFloat(this.precision))
    }
  }
})
