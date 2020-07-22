//配置数据连接
var Sequelize = require("sequelize")
var sequelize = new Sequelize('yisheng','root','sise',{
    host:'localhost',
    dialect:'mysql',
    //operatorsAliases:false,
    dialectOptions:{
        //字符集
        charset:'utf8mb4',
        collate:'utf8mb4_unicode_ci',
        supportBigNumbers: true,
        bigNumberStrings: true,
    },
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define:{
        paranoid:false,
        operatorsAliases: false  //设置别名
    },
    define:{
        //是否冻结表名，最好设置为true，要不sequelize会自动给表名加上复数s造成查询数据失败
        freezeTableName:true,
        //是否为表添加createAt(记录表创建时间)和updateAt(记录字段更新时间)字段
        timestamps:false,
        //是否为表添加deleteAt字段，日常删除数据并不真正删除而是添加deleteAt字段
        paranoid:false,
        //是否开启op
        //operatorsAliases:false
    },
    // 时区
    timezone: '+08:00'
    

});

sequelize
    .authenticate()

module.exports = {
    sequelize
};


