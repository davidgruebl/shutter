const control = require('./lib/control')
const Promise = require('bluebird')

;(async () => {
  await control.init()
  await control.up()
})()
