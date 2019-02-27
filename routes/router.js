const express = require('express');
const join=require('path').join;
const router = express.Router();
const formidable=require('formidable');
const Photo=require('../models/photo');
const User=require('../lib/user');
const validate=require('../lib/middleware/validate');
router.get('/', function(req, res, next) {
  /** 分页 - 参考
      Photo.count({},function(err,count){
        if(err) return next(err)
        Photo.find({})
          .limit(6)
          .sort({'_id':-1})
          .exec(function(err,photos){
              res.render('photos', {
                title: '图片列表',
                photos:photos,
              });
          })
      }) 
  */
  Photo.find({},function(err,photos){
    if(err) return next(err)
    console.log(photos)
    res.render('photos', {
      title: '图片列表',
      photos:photos,
    });
  })
});
router.get('/upload', function(req, res, next) {
  res.render('photos/upload', {
    title: '图片上传',   
  });
});
router.post('/upload',
  validate.required('photos[path]','请选择上传的图片'),
  function(req, res, next) {
  var form=new formidable.IncomingForm();
  form.uploadDir=res.locals.photos;
  form.parse(req,function(err,field,file){
    var img=file.path;
      name=field.name || img.name;
    var path=img.path.split('\\').pop();
    Photo.create({
      name:name,
      path:path
    },function(err){
      if(err) return next(err)
      res.redirect('/')
    })
  }) 
});
router.get('/photo/:id/delete', function(req, res, next) {
  Photo.remove({_id:req.params.id},function(err){
    if(err) return next(err)
    res.redirect('/')
  })
});
router.get('/photo/:id/download', function(req, res, next) {
  Photo.findById(req.params.id,function(err,photo){
    if(err) return next(err)
    var path=join(res.locals.photos,photo.path)
    // res.sendFile(path,function(){
    //   console.log('下载完成')
    // })
    res.download(path,photo.name)
  })
});
/**
 * 用户注册和登录
 */
router.get('/register',function(req,res,next){
  res.render('user/register',{
    title:'用户注册',   
  })
})
router.post('/register',function(req,res,next){
  var data=req.body.user;
  User.getByName(data.name,function(err,user){
    if(err) return next(err);    
    if(user && user.id){
      res.error('用户名已注册。');
      res.redirect('back')
    }else{
      user=new User({
        name:data.name,
        pass:data.pass
      })
      user.save(function(err){
        if(err) return next(err);
        req.session.uid=user.id;
        // req.session.username=user.name;
        res.redirect('/')
      })
    }
  })
})
router.get('/login',function(req,res,next){
  res.render('user/login',{
    title:'用户登录',   
  })
})
router.post('/login',function(req,res,next){
  var data=req.body.user;
  User.authenticate(data.name,data.pass,function(err,user){
    if(err) return next(err);
    if(user && user.id){
      req.session.uid=user.id;
      // req.session.username=user.name;
      res.redirect('/')
    }else{
      res.error('用户名或密码错误。');
      res.redirect('back')
    }
  })
})
router.get('/logout',function(req,res,next){
  req.session.destroy(function(err){
    if(err) return next(err);
    res.redirect('/')
  })
})
module.exports = router;