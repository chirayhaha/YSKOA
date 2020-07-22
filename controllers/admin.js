const userDao = require('../service/user_dao')
const md5 = require('../util/md5.js')
const uuid = require('node-uuid')
const dataformat = require('../util/dataFormat')
const fs = require('fs')
const url = require('url')
const { Avatar, ShareImg } = require('../config/config')

module.exports = {
    getAllusers:async(ctx,next) => {  //获取全部普通用户信息
        let roleid=ctx.params.roleid
        let count = await userDao.countAllUsers(roleid)
        let limit = 10/* 每页多少条 */
        let n = 0 
        n = ctx.params.pagesize-1/** 从页面获取现在是第几页，然后limit(n*limit,limit)*/
        console.log(n)
        if(count%limit == 0){
            pagesize = count / limit
        }
        else{
            pagesize = parseInt(count / limit)  + 1
        }
        let data = await userDao.getAllUser(roleid,limit,n)
        await ctx.render('userinfo',{
            data:data,
            pagesize:pagesize
        })
    },
    delete:async(ctx,next)=>{   //删除用户
        let userid=ctx.params.userid
        let result = await userDao.delUser(userid)
        await ctx.response.redirect('/users/all/1/1')
    },
    setadmin:async(ctx,next)=>{  //设为管理员
        let userid=ctx.params.userid
        await userDao.setAdmin(userid)
        await ctx.response.redirect('/users/all/1/1')
    },
    addAdmin:async(ctx,next)=>{ //注册
        let solt = uuid.v4()
        let {username,userid,password} = ctx.request.body
        let md5password = await md5.MD5(password,solt)
        let user = await userDao.getUserAdminInfo(userid)
        if(!user){
            await userDao.addAdmin(username,userid,md5password,solt)
            ctx.body={
                code:1,
                message:'注册成功'
            }
            await ctx.response.redirect('/login')
        }
        else{
            ctx.body={
                code:-1,
                message:'用户已存在'
            }
        }
    },
    getAllWebs:async(ctx,next)=>{ //获取考试
        let count = await userDao.countAllWebs()
        let limit = 3/* 每页多少条 */
        let n = 0 
        n = ctx.params.pagesize-1
        if(count%limit == 0){
            pagesize = count / limit
        }
        else{
            pagesize = parseInt(count / limit)  + 1
        }
        let data = await userDao.getAllWebs(limit,n)
        await ctx.render('websites',{data:data,pagesize:pagesize})
    },
    openupload:async(ctx,next)=>{
        await ctx.render('uploadwebsites',{code:1})
    },
    getarticles:async(ctx,next)=>{ //获取文章
        let count = await userDao.countAllArt()
        let limit = 6/* 每页多少条 */
        let n = 0 
        n = ctx.params.pagesize-1
        console.log(n)
        if(count%limit == 0){
            pagesize = count / limit
        }
        else{
            pagesize = parseInt(count / limit)  + 1
        }
        let data = await userDao.getArticles(limit,n)
        await ctx.render('articles',{data:data,pagesize:pagesize})
    },
    passornot:async(ctx,next)=>{ //审核
        let { pass, id } = ctx.params
        let result = await userDao.PassOrNot(pass,id)
        if(result){await ctx.response.redirect('/users/getarticles/1')}
    },
    goshare:async(ctx,next)=>{
        await ctx.render('share')
    },
    share:async(ctx,next)=>{ //发布文章
        let userid = ctx.state.user.userid
        let createtime = dataformat.getNowFormatDate()
        let {title, context} = ctx.req.body
        console.log(ctx.req.body)

        let pho = ctx.req.file
        console.log(pho)
        if(ctx.req.file&&ctx.req.body){
            await fs.rename('public/shares/'+pho.filename,'public/shares/'+userid+title+context.substring(6,7)+'.jpg',err=>{console.log('重命名成功')})
            let shareimg = url.resolve(ShareImg.baseUrl,userid+title+context.substring(6,7)+'.jpg')
            await  userDao.adminShare(userid,title,context,shareimg,createtime)
        }
        else{
            let { title, context} = ctx.request.body
            let result = await userDao.shareInfo(userid, title, context, createtime)
            if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
        }
    },
    uploadwebs:async(ctx,next)=>{ //上传考试
        let { weblink,webname,testtime,testinfo } = ctx.request.body
        let result = await userDao.uploadWebs(weblink,webname,testtime,testinfo)
        if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
    },
    editwebs:async(ctx,next)=>{ //编辑考试信息
        let { weblink,webname,testtime,testinfo } =ctx.request.body
        let id = ctx.params.id
        let result = await userDao.editWebs(id,weblink,webname,testtime,testinfo)
        if(result){ctx.body={code:1}}else{ctx.body={code:-1}}
    },
}