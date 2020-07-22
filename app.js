const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const session = require('koa-session')//保存在服务器上
const passport = require('koa-passport')
const cors=require('./config/cors_config');//跨域处理
const errorhandle = require('./middlewares/error')

const index = require('./routes/index')
const admin = require('./routes/admin')
const users = require('./routes/usersapi/users')

const log4js = require('./util/log4j')

// error handler
onerror(app)

//session
app.use(session({
  key: 'koa:sess', /** 名称，可以不管 */
  maxAge: 7200000, /** (number) maxAge in ms (default is 1 days)，过期时间，这里表示2个小时 */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
},app));

app.keys = ['this is my secret set'];

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text'],
  extended:false
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))//静态资源

app.use(views(__dirname + '/views', {
  map:{html:'ejs'}
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  //console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  log4js.resLogger(ctx,ms)
})

//koa-passport配置    !!!!!!!!!!必须在route前用
app.use(passport.initialize())
app.use(passport.session())

app.use(cors);

// routes
app.use(index.routes(), index.allowedMethods())//启动路由//设置后，根据ctx.ststus设置response响应头
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(),admin.allowedMethods())


//error
app.use(errorhandle);

// error-handling
app.on('error', (err, ctx) => {
  log4js.errLogger(ctx,err)
  console.error('server error', err, ctx)
});

module.exports = app
