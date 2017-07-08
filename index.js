const control = require('./lib/control')

;(async () => {
  await control.init()
  await control.up()
})()
