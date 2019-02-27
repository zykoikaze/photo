const express=require('express');
var res=express.response;
res.message=function(msg,type){
   type=type || 'error';
   var sess=this.req.session;  
   sess.message=sess.message || [];
   sess.message.push({
      type:type,
      string:msg
   })
}
res.error=function(msg){
   return this.message(msg,'error')
}
module.exports = function(req,res,next){
   res.locals.messages=req.session && req.session.message || [];
   res.locals.removeMessages=function(){
      req.session.message=[];
   }
   next()
}