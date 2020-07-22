const router = require('koa-router')()
const homecontroller = require('../controllers/home')

router.get('/index', homecontroller.index)

router.get('/', homecontroller.login)

router.get('/login', homecontroller.login)

router.get('/register', homecontroller.register)

router.post('/checklogin',homecontroller.checklogin)

module.exports = router