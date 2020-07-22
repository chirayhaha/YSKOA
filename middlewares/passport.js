const userDao = require("../service/user_dao")
const md5 = require('../util/md5')
//用于自己定义的基于用户名、密码的验证规则
var LocalStrategy = require('passport-local').Strategy  //认证策略

const passport = require('koa-passport')
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;//函数
const opts = { 
    //方法定义从请求头的Authrization抽取token数据
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:"hahaha" ///密钥，验证令牌签名
}

//jwt验证    work    //opts为需要验证的字段名
passport.use(new JwtStrategy(opts,async(jwt_payload,done) =>{ 
    //jwt_payload返回的是登录时返回的数据即payload
    const user = await userDao.getUserInfo(jwt_payload.userid);
    if(user){
        user.password = ''
        user.solt = ''
        done(null,user); //返回的验证结果
    }
    /* else{
        const seller = await userDao.getSellerInfo(jwt_payload.userid)
        if(seller){
            seller.password = ''
            seller.solt = ''
            done(null,seller); //返回的验证结果
        }else{
            done(null,false);
        }
        
    } */
}))

//本地验证   work
passport.use(new LocalStrategy({
    usernameField: 'userid',
    passwordField: 'password'
    },
    async function (username, password, done) {
        let result = await userDao.getUserAdminInfo(username);
        if (result !== null) {
            let md5pass = await md5.MD5(password,result.solt)
            if(md5pass === result.password){
                return done(null, result,'登录成功')
            }else{
                return done(null, false, '密码错误')
            }
        } else {
            return done(null, false, '账号异常')
        }
    }
))

//验证用户提交凭证是否正确
// serializeUser序列化 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeUser(function (user, done) {
    //保护密码
    user.password =''
    user.solt=''
    done(null, user) //
})
// deserializeUser 在每次请求的时候将从sesssion 中读取用户对象存储在req.user
passport.deserializeUser(function (user, done) {
    done(null, user)
})

module.exports = passport