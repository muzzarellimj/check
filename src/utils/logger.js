const morgan = require('morgan')
const chalk = require('chalk')

const morganChalk = morgan(function (tokens, req, res) {
    return [
        `[${tokens.date(req, res)}]`,
        method(tokens.method(req, res)),
        statusCode(tokens.status(req, res)),
        tokens.url(req, res),
        chalk.yellow(tokens['response-time'](req, res) + ' ms'),
    ].join(' ')
})

const method = (method) => {
    switch (method) {
        case 'GET':
            return chalk.bgGreen.bold(method)
        case 'POST':
            return chalk.bgYellow.bold(method)
        case 'PUT':
            return chalk.bgBlue.bold(method)
        default:
            return chalk.bgRed.bold(method)
    }
}

const statusCode = (statusCode) => {
    if (statusCode >= 400) return chalk.red.bold(statusCode)
    else if (statusCode >= 300) return chalk.yellow.bold(statusCode)
    else if (statusCode >= 200) return chalk.green.bold(statusCode)
    else return chalk.bold(statusCode)
}

module.exports = {
    morganChalk
}