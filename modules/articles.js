//DataTypes类属性对应数据库中创建字段的数据类型，它是一个静态类可以直接引用其属性或方法
module.exports = function(sequelize,DataTypes){
    return sequelize.define(
        'articles',
        {
            context:{
                type: DataTypes.STRING,
                field:'context'
            },
            userid:{
                type: DataTypes.STRING,
                field:'userid'
            },
            title:{
                type: DataTypes.STRING,
                field:'title',
            },
            image:{
                type: DataTypes.STRING,
                field:'image'
            },
            sent:{
                type:DataTypes.TINYINT,
                field:'sent'
            },
            createtime:{
                type:DataTypes.DATE,
                field:'createtime'
            },
            pass:{
                type:DataTypes.INTEGER,
                field:'pass'
            },
        }
    )
}