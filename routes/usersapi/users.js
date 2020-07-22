const router = require('koa-router')()
const userController = require('../../controllers/user')
const passport = require('../../middlewares/passport')

const multer = require('koa-multer')
const upload = multer({dest:'public/uploads'})
const share = multer({dest:'public/shares'})

router.prefix('/api/users')

router.post('/postlogin',userController.postlogin)

router.post('/registerinfo',userController.registerinfo)

router.post('/userinfo',userController.userinfo)

router.get('/logout',userController.logout)

router.get('/getwebinfo',userController.getWebInfo)

router.post('/edituserinfo',userController.editUserInfo)

router.post('/updatepassword',userController.updatePassword)

router.get('/getverifycode',userController.getverifycode)

router.post('/share', share.single('file'), userController.share)

/*upload.single是koa-multer库提供的一个函数,上传一个文件*/
router.post('/updateAvatar',upload.single('file'),userController.updateAvatar)

router.post('/getmyshare',userController.getmyshare)

router.post('/getshareinfos',userController.getshareinfos)

router.post('/getsharedetail',userController.getsharedetail)

router.post('/getuserinfo',userController.getuserinfo)

router.post('/comment',userController.comment)

router.post('/getcomments',userController.getcomments)

router.post('/like',userController.like)

router.post('/unlike',userController.unlike)

router.post('/isliked',userController.isliked)

router.post('/delcomment',userController.delcomment)

router.get('/searchtest',userController.searchtest)

router.get('/searcharticles',userController.searcharticles)

router.post('/getreward',userController.getreward)

router.post('/getmylikes',userController.getmylikes)

router.post('/delarticle',userController.delarticle)

router.post('/comothers',userController.comothers)

router.post('/getresponse',userController.getresponse)

router.post('/findpassword',userController.findpassword)

router.post('/follow',userController.follow)

router.post('/unfollow',userController.unfollow)

router.post('/isfollow',userController.isFollow)

router.post('/editshare',share.single('file'), userController.editShare)

router.post('/getmyfollow',userController.getmyfollow)

router.post('/getmycomments',userController.getmycomments)

router.post('/delresponse',userController.delresponse)

router.all('/*',
passport.authenticate('jwt', { session: false }), //不需要session    解析token
async(ctx,next) =>{
  console.log(ctx.request)
  await next()
})

router.get('/userinfo',userController.userinfo)

module.exports = router