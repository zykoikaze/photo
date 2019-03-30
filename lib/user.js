const redis=require('redis');
const bcrypt=require('bcrypt');
const client=redis.createClient();
function User(obj){
   this['user']={};
   for(var key in obj){
      this['user'][key]=obj[key]
   }
}
User.prototype.save=function(fn){
   var user=this['user'];
   var _this=this;
   if(user.id){
      _this.update(fn)
   }else{      
      client.incr('user:ids',function(err,id){
         if(err) return fn(err);
         user.id=id;
         _this.hashPassword(function(err){
            if(err) return fn(err);
            _this.update(fn);
         })
      })
   }
}
User.prototype.update=function(fn){
   var user=this['user'];
   var id=user.id;
   client.set('user:id:'+user.name,id,function(err){
      if(err) return fn(err);      
      client.hmset('user:'+id,user,function(err){
         if(err) return fn(err);
         fn(null,user);
      })
   })
}
User.prototype.hashPassword=function(fn){
   var user=this['user']; 
   bcrypt.genSalt(12,function(err,salt){
      if(err) return fn(err);
      user.salt=salt;
      bcrypt.hash(user.pass,salt,function(err,hash){
         if(err) return fn(err);
         user.pass=hash;
         fn();
      })
   })
}
User.getByName=function(name,fn){
   User.getId(name,function(err,id){
      if(err) return fn(err);
      console.log(id)
      User.get(id,fn);
   })
}
User.getId=function(name,fn){
   client.get('user:id:'+name,fn)
}
User.get=function(id,fn){
   client.hgetall('user:'+id,function(err,user){
      if(err) return fn(err);      
      // fn(null,new User(user))
      fn(null,user)
   })
}
User.authenticate=function(name,pass,fn){
   User.getByName(name,function(err,user){
      if(err) return fn(err);
      if(user){
         bcrypt.hash(pass,user.salt,function(err,hash){
            if(err) return fn(err);
            if(hash == user.pass) return fn(null,user);
            fn();
         });
         return;
      }
     fn();
   })
}
module.exports=User;