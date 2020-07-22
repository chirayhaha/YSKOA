const passport = require('../middlewares/passport')

module.exports = {
    index:async(ctx,next) => {  //管理员首页获取登录信息
        let userInfo= ctx.state.user
        /* console.log(userInfo) */
        await ctx.render('index',{userInfo:userInfo})
    },

    login:async(ctx,next) => {   
        await ctx.render('login',{error:''})
    },

    register:async(ctx,next) => { 
        await ctx.render('register')
    },

    checklogin:async(ctx,next)=>{   //登录jwt本地验证登录
        return passport.authenticate('local',async(err,user,info)=>{
            if(err){
                await ctx.render('error',{message:'抱歉，权限验证错误',error:err})
            }
            if(!user){ //passport本地验证获取user错误 非管理员 所以user不存在
                await ctx.render('register',{error:info})
            }
            else{
                ctx.login(user) //为登录用户初始化session，passport方法
                await ctx.response.redirect('/index')
            }
        })(ctx);
    }, 
}