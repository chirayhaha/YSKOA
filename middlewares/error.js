module.exports = async(ctx,next) => {
    try{
        await next();
        if(ctx.status >= 400){
            ctx.throw(ctx.status);
        }
    }
    catch(err){
        console.error(err.stack);
        const status = err.status || 500;
        ctx.status = status;
        if(status === 404){
            await ctx.render('error',{message:'抱歉，网页找不到',error:err});
        }
        else if (status === 401) {
            await ctx.render('error',{message:'无权访问！',error:err});
        }
        else if(status ===500){
            await ctx.render('error',{message:'抱歉，服务器神游去了',errorerr});
        }
        else{
            await ctx.render('error',{message:'抱歉，我也不知道为什么',error:err});
        }
    }
};