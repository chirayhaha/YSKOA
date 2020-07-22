const userDao = require('../service/user_dao')
const md5 = require('../util/md5.js')
const jwt = require('jsonwebtoken')
const uuid = require('node-uuid')
const upload = require('../middlewares/upload')
const fs = require('fs')
const url = require('url')
const { Avatar, ShareImg } = require('../config/config')
const svgCaptcha = require('svg-captcha')

module.exports = {
    postlogin:async(ctx) => {  //用户验证登录
        const data = ctx.request.body
        //查询用户
        const user = await userDao.getUserInfo(data.userid)
        ctx.session.userid = user.userid;
        //判断用户是否存在
        if(!user){
            //表示不存在该用户
            ctx.body = {
                code:-1,
                message:'该用户不存在'
            };
            return
        }
        //验证密码
        let md5pass = await md5.MD5(data.password,user.solt)
        console.log(data.verifycode)
        console.log(ctx.session.code)
        if(md5pass === user.password && data.verifycode == ctx.session.code){
            const payload = {
                userid:user.userid,
                username:user.username,
                avatar:user.avatar,
            };
            //生成token
            const token = jwt.sign(payload,"hahaha",{ //元数据，密钥
                expiresIn:3600*7
            });
            ctx.status = 200;
            ctx.body = {
                code:1,
                data:{
                    message:'验证成功',
                    token:'Bearer '+token,
                    userid:user.userid,
                    avatar:user.avatar
                }
            };
        }
        else{
            if(data.verifycode != ctx.session.code){
                ctx.body={code:3,data:{message:"验证码错误"}}
            }
            else{
                ctx.body = {
                    code:0,
                    data:{
                        message:'密码错误'
                    }
                };
            }
            
        }
    },
    registerinfo:async(ctx,next)=>{  //注册新用户
        let solt = uuid.v4()
        let {username,userid,password,question,ans} = ctx.request.body
        let md5password = await md5.MD5(password,solt)
        let user = await userDao.getUserInfo(userid)
        if(!user){
            await userDao.addUser(username,userid,md5password,solt,question,ans)
            ctx.body={
                code:1,
                message:'注册成功'
            }
        }
        else{
            ctx.body={
                code:-1,
                message:'用户已存在'
            }
        }
    },
    logout:async(ctx,next) => {  //退出登录
        ctx.logout() //删除用户session
        await ctx.render('login',{error:''})
    },
    userinfo:async(ctx,next)=>{  //获取用户登录信息
        ctx.body = {
            data:{
                message: '用户信息',
                user:ctx.state.user,
            }
        };
    },
    getWebInfo:async(ctx,next)=>{  //获取网页
        let { webname } = ctx.request.query
        console.log(JSON.stringify(ctx.request.query) )
        console.log(JSON.stringify(ctx.request.body) )
        let data = await userDao.getWebInfo(webname)
        if(data!=null){
            ctx.body = {data:data,code:1}
        }else{
            ctx.body = {code:0}
        }
    },
    editUserInfo:async(ctx,next)=>{  //更改用户名
        let { userid,username} = ctx.request.body
        let data = await userDao.editUserInfo(username,userid)
        if(data!=null){
            ctx.body = {code:1}
        }else{
            ctx.body = {code:-1}
        }
    },
    updateAvatar:async(ctx,next)=>{  //上传头像
        let avatar = ctx.req.file
        await fs.rename('public/uploads/'+avatar.filename,'public/uploads/'+ctx.session.userid+'.jpg',err=>{console.log('重命名成功')})
        let result = await userDao.updateAvatar(ctx.session.userid,url.resolve(Avatar.baseUrl,ctx.session.userid+'.jpg'))
        if(result){
            ctx.body={
                data:{avatar:url.resolve(Avatar.baseUrl,ctx.session.userid+'.jpg')},
                code:1
            }
        }
        else{ctx.body={code:-1}}
    },
    updatePassword:async(ctx,next)=>{  //更改密码
        let {userid,oldpwd,newpwd} = ctx.request.body
        let user = await userDao.getUserInfo(userid)
        let md5oldpwd = await md5.MD5(oldpwd,user.solt)
        console.log(md5oldpwd)
        console.log(user.password)
        //验证密码
        if(user.password === md5oldpwd){
            let solt = uuid.v4()
            let md5pwd = await md5.MD5(newpwd,solt)
            let data = await userDao.updatePassword(userid,md5pwd,solt)
            if(data){ctx.body={code:1}}
        }
        else{
            console.log('错误')
        }
    },
    getverifycode:async(ctx,next)=>{   //获取验证码
        var captcha = svgCaptcha.create({    //这种生成的是随机数验证码
            size:4,    //验证码长度
            fontSize:50,   //字体大小
            width:100,
            height:60,
            color:true,
            background:'white'
        });
            console.log(captcha.text);
          // 保存生成的验证码结果
            ctx.session.code = captcha.text.toLowerCase()
            // 设置响应头
            ctx.response.type = 'image/svg+xml';
            ctx.body = captcha.data;
    },
    share:async(ctx,next)=>{ //分享文章
        let pho = ctx.req.file
        if(ctx.req.file&&ctx.req.body){
            let { userid, title, context, img, sent, createtime } = ctx.req.body
            if(title == ''){
                let title = context.substring(0,12)
                await fs.rename('public/shares/'+pho.filename,'public/shares/'+userid+title+context.substring(6,7)+'.jpg',err=>{console.log('重命名成功')})
                let shareimg = url.resolve(ShareImg.baseUrl,userid+title+context.substring(6,7)+'.jpg')
                let result = await userDao.shareInfo(userid, title, context, shareimg, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }else{
                await fs.rename('public/shares/'+pho.filename,'public/shares/'+userid+title+context.substring(6,7)+'.jpg',err=>{console.log('重命名成功')})
                let shareimg = url.resolve(ShareImg.baseUrl,userid+title+context.substring(6,7)+'.jpg')
                let result = await userDao.shareInfo(userid, title, context, shareimg, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
        }
        else{
            let { userid, title, context, img, sent, createtime } = ctx.request.body
            if(title == ''){
                let title = context.substring(0,10)
                let result = await userDao.shareInfo(userid, title, context, img, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
            else{
                let { userid, title, context, img, sent, createtime } = ctx.request.body
                let result = await userDao.shareInfo(userid, title, context, img, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
        }
        
    },
    getmyshare:async(ctx,next)=>{  //我的分享
        let { userid } = ctx.request.body
        let data = await userDao.getMyShare(userid)
        if(data){
            ctx.body={code:1,data:data}
        }else{
            ctx.body={code:0}
        }
    },
    getshareinfos:async(ctx,next)=>{ //论坛列表
        let data = await userDao.getShareInfos()
        if(data){
            ctx.body={
                code:1,
                data:data
            }
        }else{
            ctx.body={code:0}
        }
    },
    getsharedetail:async(ctx,next)=>{ //文章详情页
        let { id } = ctx.request.body.id
        let data = await userDao.getShareDetail(id)
        if(data){
            ctx.body={
                code:1,
                data:data
            }
        }
    },
    getuserinfo:async(ctx,next)=>{ //获取用户信息
        let { userid } = ctx.request.body
        console.log(userid)
        let data = await userDao.getUserInfo(userid)
        if(data){
            ctx.body={code:1,data:data}
        }
        else{
            ctx.body={code:0}}
    },
    comment:async(ctx,next)=>{  //评论
        let { userid,articleid,context,time } =ctx.request.body
        let result = await userDao.comment(userid,articleid,context,time)
        if(result){
            ctx.body={code:1}
        }
        else{ctx.body={code:-1}}
    },
    getcomments:async(ctx,next)=>{ //获取评论
        let { articleid } = ctx.request.body
        let data = await userDao.getComments(articleid)
        if(data){
            ctx.body={data:data,status:200}
        }
        else{
            ctx.body={msg:'暂无评论',code:0}
        }
    },
    like:async(ctx,next)=>{ //点赞
        let { userid, articleid } = ctx.request.body
        await userDao.like(userid,articleid)
        ctx.body={code:1}
    },
    unlike:async(ctx,next)=>{ //取消点赞
        let { userid, articleid } = ctx.request.body
        await userDao.unlike(userid,articleid)
        ctx.body={code:-1}
    },
    isliked:async(ctx,next)=>{ //是否点赞
        let { userid,articleid }= ctx.request.body
        let data = await userDao.isLiked(userid,articleid)
        if(data){ctx.body={code:1,data}}
        else{ctx.body={code:0}}
    },
    delcomment:async(ctx,next)=>{ //删除评论
        let { userid,id } = ctx.request.body
        let result = await userDao.delComment(userid,id)
        if(result){ctx.body={code:1}}
        else{ctx.body={code:-1}}
    },
    searchtest:async(ctx,next)=>{ //搜索考试
        let { info } = ctx.request.query
        let data = await userDao.searchTest(info)
        if(data){ctx.body={code:1,data:data}}
        else{ctx.body={code:0,msg:'暂无相关信息'}}
    },
    searcharticles:async(ctx,next)=>{ //搜索文章
        let { info } = ctx.request.query
        let data = await userDao.searchArticles(info)
        if(data){ctx.body={code:1,data:data}}
        else{ctx.body={code:0,msg:'暂无相关信息'}}
    },
    getreward:async(ctx,next)=>{ //奖励金
        let { userid, articleid } =ctx.request.body
        let data = await userDao.getreward(userid)
        ctx.body={data:data}
    },
    getmylikes:async(ctx,next)=>{ //我的点赞
        let {userid} =ctx.request.body
        let data = await userDao.getMyLikes(userid)
        if(data){ctx.body={
            data:data
        }}
    },
    delarticle:async(ctx,next)=>{ //删除文章
        let { id } = ctx.request.body
        let result = await userDao.delArticle(id)
        if(result){
            ctx.body={code:1}
        }else{
            ctx.body={code:-1}
        }
    },
    comothers:async(ctx,next)=>{ //回复评论
        let { userid,articleid,authorid,context,time,commentid,authorname } =ctx.request.body
        console.log(authorname)
        let result = await userDao.comOthers(userid,articleid,authorid,context,time,commentid,authorname)
        if(result){
            ctx.body={code:1}
        }
        else{ctx.body={code:-1}}
    },
    getresponse:async(ctx,next)=>{ //获取回复
        let { articleid } = ctx.request.body
        let data = await userDao.getResponse(articleid)
        if(data){ctx.body={
            data:data
        }}
    },
    findpassword:async(ctx,next)=>{ //找回密码
        let { userid, newpwd } = ctx.request.body
        console.log(newpwd)
        let solt = uuid.v4()
        let md5pwd = await md5.MD5(newpwd,solt)
        let result = await userDao.findPassword(userid,md5pwd,solt)
        if(result){
            ctx.body={code:1}
        }
        else{
            ctx.body={code:-1}
        }
    },
    follow:async(ctx,next)=>{ //关注
        let { followid, userid, followname} = ctx.request.body
        let result = await userDao.follow(followid,userid,followname)
        if(result){ctx.body={code:1}}
        else{ctx.body={code:-1}}
    },
    unfollow:async(ctx,next)=>{ //取消关注
        let { followid, userid} = ctx.request.body
        let result = await userDao.unfollow(followid,userid)
        if(result){ctx.body={code:1}}
        else{ctx.body={code:-1}}
    },
    isFollow:async(ctx,next)=>{ //是否关注
        let { followid, userid} = ctx.request.body
        let result = await userDao.isFollow(followid,userid)
        if(result){ctx.body={code:1}}
        else{ctx.body={code:-1}}
    },
    editShare:async(ctx,next)=>{ //编辑草稿
        let pho = ctx.req.file
        if(ctx.req.file&&ctx.req.body){
            let { id, userid, title, context, img, sent, createtime } = ctx.req.body
            if(title == ''){
                let title = context.substring(0,12)
                await fs.rename('public/shares/'+pho.filename,'public/shares/'+userid+title+context.substring(6,7)+'.jpg',err=>{console.log('重命名成功')})
                let shareimg = url.resolve(ShareImg.baseUrl,userid+title+context.substring(6,7)+'.jpg')
                let result = await userDao.editShare(id, userid, title, context, shareimg, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }else{
                await fs.rename('public/shares/'+pho.filename,'public/shares/'+userid+title+context.substring(6,7)+'.jpg',err=>{console.log('重命名成功')})
                let shareimg = url.resolve(ShareImg.baseUrl,userid+title+context.substring(6,7)+'.jpg')
                let result = await userDao.editShare(id, userid, title, context, shareimg, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
        }
        else{
            let { id, userid, title, context, img, sent, createtime } = ctx.request.body
            if(title == ''){
                let title = context.substring(0,10)
                let result = await userDao.editShare(id, userid, title, context, img, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
            else{
                let { userid, title, context, img, sent, createtime } = ctx.request.body
                let result = await userDao.editShare(id, userid, title, context, img, sent, createtime)
                if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
            }
        }
    },
    getmyfollow:async(ctx,next)=>{ //我的关注
        let { userid } = ctx.request.body
        let data = await userDao.getmyfollow(userid)
        if(data){
            ctx.body={data:data,code:1}
        }else{ctx.body={code:-1}}
    },
    getmycomments:async(ctx,next)=>{ //我的评论消息
        let { userid } =ctx.request.body
        let data = await userDao.getMyComments(userid)
        if(data){
            ctx.body={data:data,code:1}
        }else{ctx.body={code:-1}}
    },
    delresponse:async(ctx,next)=>{ //删除回复
        let { userid, id } = ctx.request.body
        let result = await userDao.delRespone(userid,id)
        if(result){ctx.body={code:1}}
        else{ctx.body={code:-1}}
    }
}