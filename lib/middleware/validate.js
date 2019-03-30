function parseField(field){
   var array=field.split(/\[|\]/g);
   var newArray=array.filter(function(ele,index,own){
      return ele;
   });
   return newArray;
}
function getField(req,field){ 
   var data=req.body;
   try{
      field.forEach(function(val){   
         data=data[val]
      })
   }catch(err){
      data=null;
   }
   return data;
}
exports.required=function(field,msg){
   field=parseField(field);
   return function(req,res,next){
      var data=getField(req,field);
      if(data){
         next()
      }else{
         res.error(msg);
         res.redirect('back');
      }
   }
}