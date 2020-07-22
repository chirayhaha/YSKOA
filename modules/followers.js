exports.default = function(Sequelize,DataTypes){
    return Sequelize.define(
        'followers',
        {
            followid:{
                type: DataTypes.STRING,
                field:'followid'
            },
            userid:{
                type: DataTypes.STRING,
                field:'userid'
            },
            
        }
    )
}