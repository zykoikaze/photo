const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/photo_app',{ useNewUrlParser: true });
var schema=new mongoose.Schema({
   name:String,
   path:String
})

// var Photo=mongoose.model('Photo',schema);

// var sub_photo=new Photo({
//    name:'测试mongoose',
//    path:'测试mongoose是否可用.'
// });
// sub_photo.save(function(err){
//    if(err) console.log(err);
//    console.log('saved.')
// })

module.exports=mongoose.model('Photo',schema)