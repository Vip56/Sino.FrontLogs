const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const pool = require('./dbpool');   //使用连接池模块获取连接
const sendEmail=require('./controller/sendEmail.js'); //发送邮件工具
const deleteLog=require('./controller/deleteLog.js'); //日志清除方法
const schedule = require('node-schedule');//定时清除日志工具
const json2xls = require('json2xls');//导出excel
const getccplog =require('./routes/getccplog');//ccp接口
const getcsplog =require('./routes/getcsplog');
const gettmslog =require('./routes/gettmslog');
const URL =require('url');
app.use(bodyParser.json());
app.use(bodyParser.text());

/**
 * 日志级别对应的颜色枚举
 */
const levelColorEnum = {
    info: [32, 39],
    warn: [33, 39],
    error: [31, 39],
};

/**
 * 获取日志颜色   
 * 
 * @param {string} level - 日志级别
 */
const colorize = level => {
    const color = levelColorEnum[level];
    return {
        start: `\x1B[${color[0]}m`,
        end: `\x1B[${color[1]}m`,
    };
};
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
 'jfry.cn',
]; 
/**
 * 允许跨域
 */
app.use((req, res, next) => {
      // res.header("Access-Control-Allow-Origin", '*');
    let reqOrigin = req.headers.origin; // request响应头的origin属性
        if(isOriginAllowed(reqOrigin, ALLOW_ORIGIN)) {
            res.header("Access-Control-Allow-Origin", reqOrigin);
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length,Authorization,Accept,X-Requested-With,X-Request-Id");
            res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
            res.setHeader('Content-Type','text/javascript;charset=UTF-8'); //解决res乱码
            next();
          } else {
            res.send({ code: -2, msg: '非法请求' });
            }
});

app.use('/log', (req, res) => {
    let logs = req.body;
    console.log('logs',logs);
    if (typeof logs === 'string') {
        try {
            logs = JSON.parse(logs);
            res.send(logs); 
        } catch (err) {
            logs = null;
        }
    }

    // 如果日志是一个数组，说明是正常的数据
    if (Array.isArray(logs)) {
       
        logs.forEach(log => {
            var time = log.time;
            var level = log.level;
           // const msgs = JSON.stringify(log.messages);
           var msgs = JSON.stringify(log.messages);
           var uid=log.messages[0];
           var url = log.url;
           var userAgent = log.agent;
           var color = colorize(level);
            console[level](`${color.start}[${time}] [${level.toUpperCase()}] [${url}] -${color.end}`, ...msgs, `用户代理: ${userAgent}`);
            //发送到数据库  
            //截取域名判断
            var hostname=URL.parse(url,false,true).hostname;
             //根据域名插入不同的记录表
            switch(hostname)
            {
                case "tms.sowl.cn":
                      //tms
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO tms_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    break;
                case "csp.sowl.cn":
                     //csp
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO csp_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    break;
                case "ccp.sowl.cn":
                    //ccp
                    pool.getConnection((err, conn)=>{
                        if(err){
                            return;
                        }
                        conn.query('INSERT INTO ccp_log_total VALUES(NULL,?,?,?,?,?,?)',
                            [level,time,uid,url,userAgent,msgs], (err, result)=>{ 
                                if(err){
                                    return;
                                }  
                            conn.release();
                        })
                    })
                    console.log("ccp");
                    break;       
                default:
                console.log('域名不匹配');
            }

            //error日志报警
            sendEmail(level,hostname,time,url,msgs);
            
        });
    }

    // 仅返回一个空字符串，节省带宽
    res.end('');
    // }
});
app.use(json2xls.middleware);//导出excel中间件

app.use('/getccplog',getccplog);
app.use('/getcsplog',getcsplog);
app.use('/gettmslog',gettmslog);
//调用定时清除日志服务
deleteLog.delete();
//配置接口服务
// var server = app.listen(2017,'192.168.1.188',function () {

//     var host = server.address().address;
    
//      var port = server.address().port;
    
//         console.log('demo listening at http://%s:%s', host, port);
//     })


app.listen(2017);
console.log('demo start');
