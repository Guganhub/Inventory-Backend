const asyncHandler = require("express-async-handler");
const User = require('../models/userModel')
const sendEmail = require('../utils/sendEmail')


const contactUs = asyncHandler(async(req,res)=>{
    const {subject , message} = req.body

    const user = await User.findById(req.user._id)

    if(!user){
        res.status(400).send('User not found');
    }

    if(!subject || !message){
        res.status(400).send('Please add the subject and message');
    }
    const send_to = "guganesh12345@outlook.com"
    const sent_from = "guganesh12345@outlook.com"
    const reply_to = user.email;

   try{
        await sendEmail(subject,message,send_to,sent_from)
        res.status(200).send('Email sent successfully')
   }
   catch(error){
    res.status(500).send('Email not sent',error)
   }

})


module.exports= {contactUs}
