var express = require('express');
const router = express.Router();
const pool = require('../dbpool');
router.get('/edit',function(req,res,next){
    var sender=req.param('sender') ;
    var accepter=req.param('accepter');
    var smtp=req.param('smtp');
    var open=req.param('open');
    if (sender && accepter && smtp && open){
        pool.getConnection((err, conn)=> {
            if(err){
                console.log('err1',err);
                return ;
            }
            conn.query(
             "UPDATE email_config SET sender=?,accepter=?,smtp=?,open=?",
             [sender,accepter,smtp,open],
              (err, result)=> {
                  if(err){
                      console.log('updateErr',err);
                      return ;
                  }
                     if(result.affectedRows>0){ //条件查询 ，找到数据
                            res.send({
                                errorMessage:null,
                                errorCode:null,
                                success:true,
                                data:{
                                    sender:sender,
                                    accepter:accepter,
                                    smtp:smtp,
                                    open:open,
                                }
                        }
                    )
                }else {  
                    res.send({
                        errorMessage:'设置失败',
                        errorCode:null,
                        success:true,
                    })
                }
                console.log('语句影响行数：'+result.affectedRows);
                })
                conn.release();
          })
    }else{
        res.send({
            errorMessage:'入参错误',
            errorCode:null,
            success:true,
        })
        };
}); 
router.get('/view',function(req,res,next){
    pool.getConnection((err, conn)=> {
      if(err){
          console.log('err1',err);
          return ;
      }
      conn.query(
       "SELECT * FROM email_config",
        (err, result)=> {
            if(err){
                console.log('viewErr',err);
                return ;
            }
               if(result.length>0){ //条件查询 ，找到数据
                      res.send({
                          errorMessage:null,
                          errorCode:null,
                          success:true,
                          data:{
                            data:result
                        }
                  }
              )
          }else {  
              res.send({
                errorMessage:'查询失败',
                errorCode:null,
                success:true,
              })
          }
          })
          conn.release();
    })
});
            

module.exports = router;