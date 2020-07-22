//建立数据库操作类，定义数据库操作类
const { user, articles, comments, likes, role, websites, likenum, response, followers } = require('../modules/index')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

//数据库操作类
class userDao {
    /**admin */
    static async getUserAdminInfo(userid) { //获取管理员信息
        return await user.findOne({
            where: {
                userid,
                roleid: 0
            }
        })
    }
    static async addUser(username, userid, password, solt, question, ans) { //管理员添加用户
        return await user.findOrCreate({
            defaults:{
                username: username,
                userid: userid,
                password: password,
                solt: solt,
                roleid: 1,
                question:question,
                ans:ans
            },
            where:{
                userid:userid
            }
        })
    }
    static async addAdmin(username, userid, password, solt) { //管理员注册
        return await user.findOrCreate({
            defaults:{
                username: username,
                userid: userid,
                password: password,
                solt: solt,
                roleid: 0,
                avatar:'http://localhost:3000/uploads/admin.png',
                question:'管理员',
                ans:'管理员'
            },
            where:{
                userid:userid
            }
        })
    }
    static async setAdmin(userid) { //设为管理员
        await user.update(
            {
                roleid: 0,
            },
            {
                where: {
                    userid
                }
            }
        )
    }
    static async getAllUser(roleid,limit,n) { //获取全部用户
        return await user.findAll({
            where: {
                roleid: roleid
            },
            offset:n*limit,
            limit:limit
        })
    }
    static countAllUsers(roleid){ 
        return user.count({
            where: {
                roleid: roleid
            },
        })
    }
    static async getAllWebs(limit,n) { //获取全部考试
        return await websites.findAll({
            offset:n*limit,
            limit:limit
        })
    }
    static countAllWebs(){
        return websites.count({
            
        })
    }
    static countAllUsers(roleid){
        return user.count({
            where: {
                roleid: roleid
            },
        })
    }
    static async countAllArt(){
        return articles.count()
    }
    static async getArticles(limit,n) { //后端获取全部论坛信息
        return await articles.findAll({
            limit:limit,
            offset:n*limit,
            order:[['createtime', 'DESC']]
        })
    }
    static async adminShare(userid,title,context,img,createtime){ //发布文章
        return await articles.create({
            userid: userid,
            title: title,
            context: context,
            image: img,
            sent: 1,
            createtime: createtime,
            pass: 1
        })
    }
    static async uploadWebs(weblink,webname,testtime,testinfo){ //上传考试
        return await websites.create({
            weblink:weblink,
            webname:webname,
            testtime:testtime,
            testinfo:testinfo
        })
    }
    static async editWebs(id,weblink,webname,testtime,testinfo){ //编辑考试
        return await websites.update({
            weblink,webname,testtime,testinfo
        },{
            where:{
                id:id
            }
        })
    }
    static async delUser(userid) {  //删除用户
        return await user.destroy({
            where: {
                userid
            }
        })
    }
    static async PassOrNot(pass, id) { //审核
        return await articles.update(
            { pass: pass },
            { where: { id: id } }
        )
    }

    /**user */
    static async getUserInfo(userid) {   //获取用户信息
        return await user.findOne({
            where: {
                userid:userid,
            }
        })
    }
    static async editUserInfo(username, userid) { //更改用户名
        return await user.update({
            username: username
        }, {
            where: {
                userid: userid
            }

        }).then(res=>{
            return response.update({
                authorname:username
            },{
                where:{
                    authorid:userid
                }
            })
        })
    }
    static async updateAvatar(userid, avatar) { //上传头像
        return await user.update({ avatar: avatar }, {
            where: { userid: userid }
        })
    }
    static async updatePassword(userid, newpwd, solt) { //更改密码
        return await user.update({
            password: newpwd,
            solt: solt
        }, {
            where: {
                userid: userid
            }
        })
    }
    static async getWebInfo(webname) {  //获取网址详情页信息
        return await websites.findOne({
            where: {
                webname: webname
            }
        })
    }
    static async shareInfo(userid, title, context, img, sent, createtime) {//分享文章
        return await articles.create({
            userid: userid,
            title: title,
            context: context,
            image: img,
            sent: sent,
            createtime: createtime,
            pass: 0
        })
    }
    static async editShare(id,userid, title, context, img, sent, createtime){//编辑草稿
        return await articles.update(
            {
                title: title,
                context: context,
                image: img,
                sent: sent,
                createtime: createtime,
                pass: 0
            },
            {
                where:{
                    userid:userid,
                    id:id
                }
            }
        )
    }
    static async getMyShare(userid) { //我的分享
        return await articles.findAll({
            include:{
                model:likenum,
                attributes:['likenum']
            },
            where: {
                userid: userid
            },
            order: [['id', 'DESC']]
        })
    }
    static async getShareInfos() {  //论坛列表
        return await articles.findAll({
            where: { sent: 1, pass: 1 },
        })
    }
    static async getShareDetail(id) { //文章详情
        return await articles.findOne({
            include: {
                model: likenum,
                attributes: ['likenum']
            },
            where: { id: id }
        })
    }
    static async comment(userid, articleid, context, time) { //评论
        return await comments.create({
            userid: userid,
            articleid: articleid,
            context: context,
            time: time
        })
    }
    static async getComments(articleid) { //获取评论
        return await comments.findAll({
            include: {
                model: user,
                attributes: ['username', 'avatar','userid']
            },
            where: { articleid: articleid }
        })
    }
    static async delComment(userid, id) { //删除评论
        return await comments.destroy({
            where: {
                userid: userid,
                id: id
            }
        }).then(res=>{
            return response.destroy({
                where:{
                    commentid:id
                }
            })
        })
    }
    /**回复别人的评论 */
    static async comOthers(userid,articleid,authorid,context,time,commentid,authorname){
        return response.create({
            userid:userid,
            articleid:articleid,
            authorid:authorid,
            context:context,
            time:time,
            commentid:commentid,
            authorname:authorname,
        })
    }
    static async getResponse(articleid){ //获取回复
        return response.findAll({
            include:{
                model:user,
                attributes:['username','avatar','userid']
            },
            where:{
                articleid:articleid
            }
        })
    }
    static async like(userid, articleid) { //点赞
        return await likes.findOrCreate({
            where: { userid: userid, articleid: articleid },
            defaults: { userid: userid, articleid: articleid }
        }
        ).spread(function (tag, created) {
            if (created) {
                likenum.findOrCreate({
                    where: { articleid: articleid },
                    defaults: { articleid: articleid }
                }).then(res => {
                    likenum.increment(
                        { likenum: 1 }
                        , {
                            where: {
                                articleid: articleid
                            }
                        })

                })
            }

        })
    }
    static async unlike(userid, articleid) { //取消点赞
        return await likes.destroy(
            { where: { userid: userid, articleid: articleid } }
        ).then(res => {
            likenum.decrement(
                { likenum: 1 }
                , {
                    where: {
                        articleid: articleid,
                    }
                })
        })
    }
    static async isLiked(userid, articleid) { //是否点赞
        return await likes.findOne({
            where: { userid: userid, articleid: articleid }
        })
    }
    static async searchTest(info) { //搜索考试
        return await websites.findAll({
            where: {
                [Op.or]: [
                    {
                        webname: {
                            [Op.like]: '%' + info + '%'
                        },
                    }, {
                        testinfo: {
                            [Op.like]: '%' + info + '%'
                        },
                    },
                ]
            }
        })
    }
    static async searchArticles(info) { //搜索文章
        return await articles.findAll({
            include: {
                model: user,
                attributes: ['username', 'avatar']
            },
            where: {
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: '%' + info + '%'
                        },
                    }, {
                        context: {
                            [Op.like]: '%' + info + '%'
                        },
                    },
                ]
            }
        })
    }
    static async getreward(userid) {  //奖励金=article的数量+likenum
        return await articles.count({
            where: {
                userid: userid,
                pass:{[Op.ne]:-1}
            }
        })
    }
    static async getMyLikes(userid){ //我的点赞
        return await likes.findAll({
            include:{
                model:articles,
            },
            where:{
                userid:userid
            },
            order:[['articleid', 'DESC']]
        })
    }
    static async delArticle(id){ //删除文章
        return articles.destroy({
            where:{id:id}
        })
    }
    static async findPassword(userid, newpwd, solt){ //找回密码
        return await user.update({
            password:newpwd,
            solt:solt
        },{
            where:{userid:userid}
        })
    }
    static async follow(followid,userid){ //关注
        return await followers.findOrCreate({
            defaults:{
                followid:followid,
                userid:userid
            },
            where:{
                followid:followid,
                userid:userid
            }
        })
    }
    static async unfollow(followid,userid){ //取消关注
        return await followers.destroy({
            where:{
                followid:followid,
                userid:userid
            }
        })
    }
    static async isFollow(followid,userid){ //是否关注
        return await followers.findOne({
            where:{
                followid:followid,
                userid:userid
            }
        })
    }
    static async getmyfollow(userid){ //我的关注
        return await followers.findAll({
            include:{
                model:user,
                attributes:['username','avatar','userid']
            },
            where:{
                userid:userid
            }
        })
    }
    static async getMyComments(userid){ //我的回复
        return await response.findAll({
            include:{
                model:user,
                attributes:['username','avatar']
            },
            where:{
                authorid:userid
            }
        })
    }
    static async delRespone(userid,id){ //删除回复
        return await response.destroy({
            where:{
                userid:userid,
                id:id
            }
        })
    }
}

module.exports = userDao