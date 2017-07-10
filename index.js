const _ = require('lodash')
const app = require('express')()
const basicAuth = require('express-basic-auth')
const bodyParser = require('body-parser')
const greenlock = require('greenlock-express')

const control = require('./lib/control')
const {omfglolsecure} = require('./config')

app.use([
  basicAuth({users: {omfglolsecure}}),
  bodyParser.json()
])

const actions = {
  'shutter-close': control.down,
  'shutter-open': control.up,
  'shutter-stop': control.stop
}

app.post('/', ({body}, res) => {
  const intentName = _.get(body, 'result.metadata.intentName', 'shutter-stop')
  const action = actions[intentName] || control.stop

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

app.get('/troll/:wat', (req, res) => {
  const actionName = req.params.wat
  const action = control[actionName]

  if (!action) return res.send('Fail')

  action().then(() => {
    res.redirect('https://www.youtube.com/watch?v=2Z4m4lnjxkY')
  })
  .catch(() => {
    res.send('Trolling failed')
  })
})

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
