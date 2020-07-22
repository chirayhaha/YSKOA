//DataTypes类属性对应数据库中创建字段的数据类型，它是一个静态类可以直接引用其属性或方法
module.exports = function(sequelize,DataTypes){
    return sequelize.define(
        'comments',
        {
            userid:{
                type: DataTypes.STRING,
                field:'userid'
            },
            context:{
                type: DataTypes.STRING,
                field:'context'
            },
            articleid:{
                type:DataTypes.INTEGER,
                field:'articleid'
            },
            time:{
                type:DataTypes.DATE,
                field:'time'
            },
        }
    )
}