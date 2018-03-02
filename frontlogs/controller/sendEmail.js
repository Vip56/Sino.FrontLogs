const nodemailer = require('nodemailer');
// error日志邮件报警

var sendEmail=(level,hostname,time,url,msgs)=>{
   
    if(level=="error"){
        var transporter = nodemailer.createTransport({
            service: 'qq',
            port: 465, // SMTP 端口
            secureConnection: true, // 使用 SSL
            auth: {
                user: '870188670@qq.com',
                //这里密码不是qq密码，是你设置的smtp密码
                pass: 'rcdbcfyxozrrbfdi'
            }
        });
        
        var mailOptions = {
            from: '870188670@qq.com', // 发件地址
            to: '351230690@qq.com;583144373@qq.com', // 收件列表
            subject: hostname+"错误日志", // 标题
            //text和html两者只支持一种
           // text:"时间：["+time+"]["+url+"]:"+msgs, // 内容
            html:`<p>域名：${hostname}</p><p>时间：${time}</p><p>页面：${url}</p><p>错误信息：${msgs}</p>`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        
        });
    }
}
module.exports = sendEmail;