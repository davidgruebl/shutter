const _ = require('lodash')
const app = require('express')()
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const greenlock = require('greenlock-express')

const control = require('./lib/control')
const {omfglolsecure} = require('./config')

let currentLevel = 0

app.use([
  basicAuth({users: {omfglolsecure}}),
  bodyParser.json()
])

const actions = {
  'shutter-close': control.down,
  'shutter-open': control.up,
  'shutter-stop': control.stop
}

const setLevel = actionName => {
  if (['shutter-close', 'down'].includes(actionName)) currentLevel = 100
  if (['shutter-open', 'up'].includes(actionName)) currentLevel = 0
}

app.post('/', ({body}, res) => {
  const intentName = _.get(body, 'result.metadata.intentName', 'shutter-stop')
  const action = actions[intentName] || control.stop

  setLevel(intentName)

  action().then(() => {
    res.json({
      speech: 'The interwebs is now controlling your shutter. What could possibly go wrong?'
    })
  })
  .catch(() => {
    res.json({
      speech: 'The internet of things has failed on you. What else did you expect?'
    })
  })
})

app.get('/match/:level', async (req, res) => {
  const level = req.params.level
  if (!level) return res.status(400).send('Please provide the desired level')

  level > currentLevel ? control.down() : control.up()
  const timeout = (Math.abs(level - currentLevel) * 270)
  await new Promise(resolve => setTimeout(resolve, timeout))
  control.stop()

  currentLevel = level
})

app.get('/move/:direction', (req, res) => {
  const actionName = req.params.direction
  const action = control[actionName]

  if (!action) return res.status(400).send('Wrong direction param. Only "up", "down" and "stop" are valid.')

  setLevel(actionName)

  action().then(() => {
    res.status(200).send(`Successfully moved ${actionName} 🎉`)
  })
  .catch(() => {
    res.status(500).send(`Moving ${actionName} failed 🤦‍♂️`)
  })
})

app.get('/level', (req, res) => res.status(200).send(`Current level: ${currentLevel}`))

control.init().then(() => {
  greenlock.create({
    app,
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    email: 'me@davidgruebl.com',
    agreeTos: true,
    approveDomains: [
      'home.dtg.sexy'
    ]
  }).listen(80, 443)
})
