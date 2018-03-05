const schedule = require('node-schedule');
const pool = require('../dbpool');   //使用连接池模块获取连接
//定时清除日志
exports.delete=()=>{
    var rule = new schedule.RecurrenceRule();
    var curDate=new Date().getDate();//获取当前日期【几号】
   // rule.date = curDate;//设置每月【几号】执行任务
    rule.date = 1;//设置每月1号执行任务
    var dellog = schedule.scheduleJob(rule, function(){
    var lastMonth = new Date(new Date().getTime() - 86400000*30).toLocaleString();
   // var lastMonth = new Date(new Date().getTime() - 100000).toLocaleString();
    pool.getConnection((err, conn)=> {
        conn.query(
          "DELETE FROM ccp_log_total WHERE time < ? ",
          [lastMonth],
          (err, result)=> {
              if(err){
                  console.log(err);
                  return ;
              }
            if(result.length>0){
               return console.log('删除日志成功');
            }
            conn.release();
          })
      })
      pool.getConnection((err, conn)=> {
      conn.query(
        "DELETE FROM csp_log_total WHERE time < ? ",
        [lastMonth],
        (err, result)=> {
            if(err){
                console.log(err);
                return ;
            }
          if(result.length>0){
              return console.log('删除日志成功');
          }
          conn.release();
        })
    })
        pool.getConnection((err, conn)=> {
        conn.query(
            "DELETE FROM tms_log_total WHERE time < ? ",
            [lastMonth],
            (err, result)=> {
                if(err){
                    console.log(err);
                    return ;
                }
            if(result.length>0){
                return  console.log('删除日志成功');
            }
            conn.release();
            })
        });  
})
}

