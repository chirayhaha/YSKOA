//建立统一管理文件
const config = require('../config/mysql_sequelize');

const Sequelize = config.sequelize

//导入模型统一管理
const user = Sequelize.import(__dirname+'/user.js')
const articles = Sequelize.import(__dirname+'/articles')
const comments = Sequelize.import(__dirname+'/comments.js')
const likes = Sequelize.import(__dirname+'/likes.js')
const role = Sequelize.import(__dirname+'/role.js')
const websites = Sequelize.import(__dirname+'/websites.js')
const likenum = Sequelize.import(__dirname+'/likenum.js')
const response = Sequelize.import(__dirname+'/response.js')
const followers = Sequelize.import(__dirname+'/followers.js')

user.belongsTo(role,{
    foreignKey:'roleid',
    targetKey:'roleid'
})

comments.belongsTo(articles,{
    foreignKey:'articleid',
    targetKey:'id'
})

comments.belongsTo(user,{
    foreignKey:'userid',
    targetKey:'userid'
})

likes.belongsTo(articles,{
    foreignKey:'articleid',
    targetKey:'id'
})

likes.belongsTo(user,{
    foreignKey:'userid',
    targetKey:'userid'
})

likenum.belongsTo(likes,{
    foreignKey:'articleid',
    targetKey:'articleid'
})

likes.hasOne(likenum,{
    foreignKey:'articleid'
})

likenum.belongsTo(articles,{
    foreignKey:'articleid',
    targetKey:'id'
})

articles.belongsTo(likenum,{
    foreignKey:'id',
    targetKey:'articleid'
})

articles.belongsTo(user,{
    foreignKey:'userid',
    targetKey:'userid'
})

user.hasMany(articles,{
    foreignKey:'userid',
})

likenum.hasMany(articles,{
    foreignKey:'id'
})

response.belongsTo(user,{
    foreignKey:'userid',
    targetKey:'userid'
})

followers.belongsTo(user,{
    foreignKey:'followid',
    targetKey:'userid'
})

response.belongsTo(comments,{
    foreignKey:'commentid',
    targetKey:'id'
})

comments.hasMany(response,{
    foreignKey:'commentid'
})

response.belongsTo(articles,{
    foreignKey:'articleid',
    targetKey:'id'
})

user.hasMany(response,{
    foreignKey:'userid'
})

module.exports = { user, articles, comments, likes, role, websites, likenum, response, followers }