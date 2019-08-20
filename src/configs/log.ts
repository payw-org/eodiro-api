import appRoot from 'app-root-path'
import winston from 'winston'

const { combine, timestamp, printf } = winston.format

const printLog = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

const options = {
  file: {
    level: 'info',
    filename: appRoot.path + '/logs/info.log',
    handleExceptions: true,
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: combine(timestamp(), printLog)
  },

  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(timestamp(), printLog)
  }
}

const logger = winston.createLogger({
  transports: [new winston.transports.File(options.file)],
  exitOnError: false
})

export default logger
