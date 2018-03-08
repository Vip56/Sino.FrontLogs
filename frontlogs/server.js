const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pool = require('./dbpool');   //使用连接池模块获取连接
const deleteLog=require('./controller/deleteLog.js'); //日志清除方法
//const pmx=require('./controller/pmx.js'); //add metric 
const schedule = require('node-schedule');//定时清除日志工具
const json2xls = require('json2xls');//导出excel
const api =require('./routes/api');//接口   汇总
const log =require('./routes/log'); //接收前端日志

app.use(bodyParser.json());
app.use(bodyParser.text());

// pmx.pmx();


//向客户端提供静态资源的响应
app.use(express.static('./demo'));

 //跨域白名单
 isOriginAllowed=(origin, allowedOrigin)=>{
    var reg=new RegExp(allowedOrigin.join("|"),"ig");   //动态生成一个正则表达式
    // var domain=str.match(reg);   //匹配 正则
    return reg.test(origin)
   }
 
const ALLOW_ORIGIN = [ // 跨域白名单
 'sowl.cn',
 'jfry.cn'
]; 
/**
 * 允许跨域
 */
app.use((req, res, next) => {
      let reqOrigin = req.headers.origin; // request响应头的origin属性
        if(isOriginAllowed(reqOrigin, ALLOW_ORIGIN)) {
            res.header("Access-Control-Allow-Origin", reqOrigin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With,X-Request-Id");
            res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
            res.setHeader('Content-Type','text/javascript;charset=UTF-8'); //解决res乱码
            next();
          } else {
            res.setHeader('Content-Type','text/javascript;charset=UTF-8'); //解决res乱码
            next();
            }
});

app.use(json2xls.middleware);//导出excel中间件
app.use('/api',api); 
app.use('/log',log); 
deleteLog.delete();//调用定时清除日志服务

//配置接口服务
var server = app.listen(2017,()=>{
    var host = server.address().address;
     var port = server.address().port;
        console.log('demo listening at http://%s:%s', host, port);
    })

