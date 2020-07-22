const router = require('koa-router')()
const adminController = require('../controllers/admin')

const multer = require('koa-multer')
/* const share = multer({dest:'public/shares'}) */

//文件上传
//配置
var storage = multer.diskStorage({
  //文件保存路径
  destination: function (req, file, cb) {
    cb(null, 'public/shares/')
  },
  //修改文件名称
  filename: function (req, file, cb) {
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
//加载配置
var share = multer({ storage: storage });

router.prefix('/users')

router.get('/all/:roleid/:pagesize',adminController.getAllusers)

router.get('/delete/:userid',adminController.delete)

router.get('/setadmin/:userid',adminController.setadmin)

router.post('/addadmin',adminController.addAdmin)

router.get('/getallwebs/:pagesize',adminController.getAllWebs)

router.get('/openupload',adminController.openupload)

router.get('/getarticles/:pagesize',adminController.getarticles)

router.get('/passornot/:pass/:id',adminController.passornot)

router.get('/goshare',adminController.goshare)

router.post('/share',share.single('file'),adminController.share)

router.post('/uploadwebs',adminController.uploadwebs)

router.post('/editwebs/:id',adminController.editwebs)

router.all('/*', async (ctx, next) => {
  if(!ctx.isAuthenticated()) {  //http request操作，检查用户是否存在session中
      ctx.status = 401
  }
  await next()
})


module.exports = router
