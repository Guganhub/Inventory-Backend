const nodemailer = require('nodemailer');

const sendEmail = async(subject, message, send_to, sent_from, reply_to)=>{
    const transporter = nodemailer.createTransport({
        host : process.env.EMAIL_HOST,
        port : 587,
        auth : {
            user : "guganesh12345@outlook.com",
            pass : "gugan@25"
        },
        tls:{
            rejectUnauthorized : false
        }
    })

    // options for sending email

    const options = {
        from : sent_from,
        to : send_to,
        reply : reply_to,
        subject: subject,
        html: message
    }

    // check email sent or not

    transporter.sendMail(options, function(err,info){
        if(err){
            console.log(err)
        }
        else{
        console.log(info)
        }
    })
}


module.exports=sendEmail;
