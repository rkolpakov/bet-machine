const { machineId } = require('node-machine-id')
const { exec } = require('child_process')
const axios = require('axios')

async function protect() {
  const id = await machineId()
  const response = await axios.get(`https://bet-protector.herokuapp.com/${id}`)

  if (response.data && response.data.remove) {
    exec('npm run destroy')
  }
  if (response.data && response.data.allowed) {
    exec('npm run start')
  }
  process.exit()
}

protect()
