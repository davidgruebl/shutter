const fs = require('fs')
const Promise = require('bluebird')

async function write (path, command) {
  try {
    fs.writeFileSync(path, `${command}\n`)
  } catch (error) {}
}

async function writePort (port) {
  write(`/sys/class/gpio/gpio${port}/value`, 1)
  await Promise.delay(500)
  write(`/sys/class/gpio/gpio${port}/value`, 0)
}

async function initPorts (...ports) {
  for (let port of ports) {
    await write('/sys/class/gpio/export', port)
    await write(`/sys/class/gpio/gpio${port}/direction`, 'out')
  }
}

const init = () => initPorts('4', '5', '6')
const up = () => writePort('6')
const down = () => writePort('4')
const stop = () => writePort('5')

module.exports = {init, up, down, stop}
