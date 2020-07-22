const log4js = require('../config/log4j_config')

const {formatError, formatRes} = require('./formateLog')

let logger = {}
let errorLogger = log4js.getLogger('error')
let resLogger = log4js.getLogger('response')

// 封装错误日志--到文件
logger.errLogger = (ctx, error, resTime) => {
    if(ctx && error) {
        errorLogger.error(formatError(ctx, error, resTime))
    }
}
// 封装响应日志--到文件
logger.resLogger = (ctx, resTime) => {
    if(ctx) {
        resLogger.info(formatRes(ctx, resTime))
    }
}

module.exports = logger