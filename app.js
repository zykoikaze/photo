var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser=require('body-parser');
var logger = require('morgan');
var Router = require('./routes/router');
var favicon=require('serve-favicon');
/** 自定义 中间件 */
var message=require('./lib/message')
var user=require('./lib/middleware/user')

/**session + redis 注册和登录*/
var session=require('express-session');
var redisStore=require('connect-redis')(session);

var app = express();
// view engine setup  设置模板引擎
//view engine设置默认模板引擎，否则render模板的时候需要加上扩展名
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//设置上传图片路径
app.set('photos',path.join(__dirname, '/public/photos'))

/**不能解析multipart/form-data */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.use(favicon(path.join(__dirname,'/public','/favicon.ico')))

app.use(logger('dev'));
app.use(cookieParser());

app.use(session({  
  secret:'user message',
  resave: true,
  saveUninitialized:false,
  store:new redisStore({
    host:'127.0.0.1',
    port:'6379'
  })
}))
app.use(message)
app.use(user)

app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  res.locals.photos = path.join(__dirname, '/public/photos');
  // res.locals.username=req.session.username || '';
  next()
})

app.use(Router)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  /**
   *  console.log(process.env.NODE_ENV) //环境变量 中设置开发环境
      console.log(req.app.get('env'))   //当前程序运行的环境
  */
 console.log(err.message)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
