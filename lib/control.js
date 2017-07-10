const {promisify} = require('util')
const fs = require('fs')

const writeFile = promisify(fs.writeFile)

const writePort = port => async () => {
  await write(`gpio${port}/value`, 0)
  await new Promise(resolve => setTimeout(resolve, 200))
  return write(`gpio${port}/value`, 1)
}

const initPorts = ports => async () => {
  for (let port of ports) {
    await write('export', port)
    await write(`gpio${port}/direction`, 'out')
    await write(`gpio${port}/value`, 1)
  }
}

module.exports = {
  init: initPorts([4, 5, 6]),
  down: writePort(4),
  stop: writePort(5),
  up: writePort(6)
}

function write (path, command) {
  return writeFile(`/sys/class/gpio/${path}`, `${command}\n`).catch(() => {})
}
