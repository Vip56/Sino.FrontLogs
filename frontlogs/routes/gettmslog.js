var express = require('express');
const router = express.Router();
const pool = require('../dbpool');
router.get('/',function(req,res,next){
      var level="";
    switch(req.param('level'))
    {
        case "0":
        level="";
        break;
        case "1":
        level="info";
        break;
        case "2":
        level="warn";
        break;
        case "3":
        level="error"
        break;
    }
    var startTime = req.param('startTime') || '';
    var endTime = req.param('endTime') || '';
    var keyword = req.param('keyword').replace(/(^\s*)|(\s*$)/g, '') || '';
    var order=' ORDER BY time desc';//降序
    var str,ll,st,et,kw;
    var strArray=[];

    var skip = req.param('skip') || '0';
    var count = req.param('count') || '0';

    //多条件查询拼接
   if(level){
    ll=' AND level=?';
    strArray.push(level);
   }else{
       ll='';
   }
   if(keyword){
    kw=' AND msgs LIKE ?';
    strArray.push('%'+keyword+'%');
   }else{
       kw='';
   }
   if(startTime){
    st=' AND time>=?';
    strArray.push(startTime);
   }else{
       st='';
   }
   if(endTime){
    et=' AND time<=?';
    strArray.push(endTime);
   }else{
       et='';
   }
   str=ll+kw+st+et;
// console.log(str);
// console.log(strArray.toString());


// 分页
var fenye=" limit "+skip+","+count;  
 //var fenye= " PID > =(select pid from tms_log_total limit "+skip+", 1) limit "+count; 

//转为时间戳
    var starttime=new Date(startTime).getTime();
    var endtime=new Date(endTime).getTime();
    //if(!level & !startTime & !endTime & !keyword){
    if(false){
      return res.send({
        status:0,
        errorMessage:'提交的字段不全',
        errorCode:10001,
        success:false,
      });
    }else{
        if(endtime && starttime && endtime<starttime){
            res.send({
                status:0,
                errorMessage:'时间节点错误',
                errorCode:10002,
                success:false,
            })
        }else{
            pool.getConnection((err, conn)=> {
                if(err){
                    console.log('err',err);
                    return ;
                }
                conn.query(
                    "SELECT pid FROM ccp_log_total WHERE 1=1"+str, //查总数
                    strArray,
                  (err, result)=> {
                      if(err){
                          console.log('err',err);
                          return ;
                      }
                  
                        var totalCount=result.length;
                        conn.query(
                            "SELECT * FROM tms_log_total WHERE 1=1"+str+order+fenye, 
                            strArray,
                            (err, result)=> {
                                if(err){
                                    console.log('err',err);
                                    return ;
                                }
                                if(result.length>0){ //条件查询 ，找到数据
                                res.send({
                                    status:1,
                                    errorMessage:null,
                                    errorCode:null,
                                    success:true,
                                    data:{
                                        data:result,
                                        total:totalCount,
                                        curcount:result.length,
                                    }
                            }
                        )
                    }else {  
                        res.send({
                            status:0,
                            errorMessage:null,
                            errorCode:null,
                            success:true,
                            data:{
                                data: [],
                                total:0,
                            }
                        })
                    }
                    })
                    conn.release();
                  })
              })
        }
    }
});

// 导出日志列表
router.get('/export',function(req,res,next){
     var level="";
    switch(req.param('level'))
    {
        case "0":
        level="";
        break;
        case "1":
        level="info";
        break;
        case "2":
        level="warn";
        break;
        case "3":
        level="error"
        break;
    }
    var startTime = req.param('startTime') || '';
    var endTime = req.param('endTime') || '';
    var keyword = req.param('keyword').replace(/(^\s*)|(\s*$)/g, '') || '';
    var order=' ORDER BY time desc';//降序
    var str,ll,st,et,kw;
    var strArray=[];

    var skip = req.param('skip') || '0';
    var count = req.param('count') || '0';

    //多条件查询拼接
   if(level){
    ll=' AND level=?';
    strArray.push(level);
   }else{
       ll='';
   }
   if(keyword){
    kw=' AND msgs LIKE ?';
    strArray.push('%'+keyword+'%');
   }else{
       kw='';
   }
   if(startTime){
    st=' AND time>=?';
    strArray.push(startTime);
   }else{
       st='';
   }
   if(endTime){
    et=' AND time<=?';
    strArray.push(endTime);
   }else{
       et='';
   }
   str=ll+kw+st+et;

//转为时间戳
    var starttime=new Date(startTime).getTime();
    var endtime=new Date(endTime).getTime();
    //if(!level & !startTime & !endTime & !keyword){
    if(false){
      return res.send({
        status:0,
        errorMessage:'提交的字段不全',
        errorCode:10001,
        success:false,
      });
    }else{
        if(endtime && starttime && endtime<starttime){
            res.send({
                status:0,
                errorMessage:'时间节点错误',
                errorCode:10002,
                success:false
            })
        }else{
            pool.getConnection((err, conn)=> {
                if(err){
                    console.log('err',err);
                    return ;
                }
                var excel=(new Date().getTime()+".xlsx").toString();
                    conn.query(
                            "select * FROM tms_log_total WHERE 1=1"+str+order, 
                            strArray,
                            (err, result)=> {
                                if(err){
                                    console.log('err',err);
                                    return ;
                                }
                          res.xls('tms'+excel, result);
                    })
                    conn.release();
              })
        }
    }
});


module.exports = router;