//DataTypes类属性对应数据库中创建字段的数据类型，它是一个静态类可以直接引用其属性或方法
module.exports = function(sequelize,DataTypes){
    return sequelize.define(
        'websites',
        {
            weblink:{
                type: DataTypes.STRING,
                field:'weblink'
            },
            webname:{
                type: DataTypes.STRING,
                field:'webname'
            },
            testtime:{
                type: DataTypes.STRING,
                field:'testtime'
            },
            testinfo:{
                type:DataTypes.STRING,
                field:'testinfo'
            }
        }
    )
}