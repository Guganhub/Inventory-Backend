const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

const jwt = require('jsonwebtoken')

const Token = require('../models/tokenModel')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')


const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: '1d'})
}






// User Registeration

const registerUser = asyncHandler(async(req,res)=>{
    const {name, email, password} = req.body


    if(!name || !email || !password){
        res.status(400).send('Please fill all the fields')
    }
    if(password.length<6){
        res.status(400)
        .send('Password must be upto 6 characters')
    }
   

    //check the user's email already exists

    const userEmailExists = await User.findOne({email})
    if(userEmailExists){
        res.status(400)
        .send('User with this Email already exists')
    }


    
    // password encryption

    const salt = await bcrypt.genSalt(5)
    const hashedPassword = await bcrypt.hash(password, salt)

    //  create new user

    const user = await User.create({
        name,
        email,
        password
    })

    // generate token

    const token = generateToken(user._id)
    

    //send HTTP-only cookie

    res.cookie('token',token, {
        path:'/',
        httpOnly:true,
        expires:new Date(Date.now() +1000 * 8600),// 1 day time
        sameSite : 'none',
        secure:true
    })


    if(user){

        const {_id,name,email,image,mobile} = user
        res.status(201).json({
            _id,name,email,image,mobile,token
        })
    }
    else{
        res.status(400)
        .send('Invalid User')
    }
});

// User Login

const loginUser = asyncHandler(async(req,res)=>{
    const {email , password} = req.body

    // validation

    if(!email || !password){
        res.status(400).send('Please add email and password')
    }

    // if user exists

    const user = await User.findOne({email})

    if(!user){
        res.status(400).send('User not found, Please register')
    }

    // password validation

    const passwordIsCorrect = await bcrypt.compare(password,user.password)
     // generate token

     const token = generateToken(user._id)
    // console.log(token)

     //send HTTP-only cookie
 
     res.cookie('token',token, {
         path:'/',
         httpOnly:true,
         expires:new Date(Date.now() +1000 * 8600),// 1 day time
         sameSite : 'none',
         secure:true
     })
    //  console.log(res.cookie(token))
 
 
    if(user && passwordIsCorrect ){
        const {_id,name,email,image,mobile}= user
        res.status(201).json({
            _id,name,email,image,mobile,token
        });
    }
    else{
        
        res.status(400).send('Invaild email or password')
    }

  
});

// logout user

const logoutUser = asyncHandler(async(req,res)=>{
   
    res.cookie('token','', {
        path:'/',
        httpOnly:true,
        expires:new Date(0),
        sameSite : 'none',
        secure:true
    });
    return res.status(200).send({
        message:"Successfully logged out"
        })
});

// Get user details

const getUser = asyncHandler(async(req,res)=>{
   const user = await User.findById(req.user._id)

   if(user){

    const {_id,name,email,image,mobile} = user
    res.status(201).json({
        _id,name,email,image,mobile
    })
}
else{
    res.status(400)
    .send('Invalid User')
}
})

// get login status

const loginStatus = asyncHandler(async(req,res)=>{
    const token = req.cookies.token
    if(!token){
        return res.json(false)
    }
    //verify token
    const verify = jwt.verify(token, process.env.JWT_SECRET)
    if(verify){
        return res.json(true)
    }
    else{
        return res.json(false)
    }
})


const updateUser = asyncHandler(async(req,res)=>{
    const user= await User.findById(req.user._id)
    if(user){
        const {name,email,image,mobile} = user;
        user.email=email;
        user.name= req.body.name || name;
        user.image = req.body.image || image;
        user.mobile = req.body.mobile || mobile;

        const updatedUser = await user.save()
        res.status(201).json({
            _id:updatedUser.id,
            name:updatedUser.name,
            email:updatedUser.email,
            image:updatedUser.image,
            mobile:updatedUser.mobile
        })
    } 
    else{
        res.status(404).send('User not found')
    }
})



// change password

const changePassword = asyncHandler(async(req,res)=>{
   const user = await User.findById(req.user._id);

   const {oldPassword,password}= req.body;

   if(!user){
    res.status(400).send('User not found')
   }

   //validation

   if(!oldPassword || !password){
    res.status(400).send('Please add old password');
   }

   //check if old password is matched with password in db
   
   const passwordIsCorrect = await bcrypt.compare(oldPassword,user.password);

   // save new password

   if(user && passwordIsCorrect){
    user.password= password;
    await user.save();
    res.status(200).send('Password Changed')
   }
   else{
    res.status(400).send('Old Password is Incorrect')
   }
})


const forgotPassword = asyncHandler(async(req,res)=>{
   const {email} = req.body
   const user = await User.findOne({email})

   if(!user){
    res.status(404).send('User does not exists');
   }

   // Delete token if it already exists

   let token = await Token.findOne({userId:user._id})
   if(token){
    await token.deleteOne()
   }
   // create reset token

   let resetToken = crypto.randomBytes(32).toString('hex')+ user._id

   console.log(resetToken);

//Hash the Token before saving to the db

   const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
//    console.log(hashedToken)

   // save token to db

   await new Token({
    userId:user._id,
    token : hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now()+ 30 * (60* 1000) // 30 mins
   }).save()

   // reset url

   const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

   const message = `
   <h2>Hai ${user.name}</h2>
   <p> Please find the url below to reset your password.</p>
   <p>The reset link is valid for 30 minutes.</p>
   <a href = ${resetUrl} clicktracking = off> ${resetUrl}</a>
   <p>Regards<p>
   <p>Admin Team</p>`

   const subject = "Reset Password Email"
   const send_to = user.email
   const sent_from = process.env.EMAIL_USER


   try{
        await sendEmail(subject,message,send_to,sent_from)
        res.status(200).send('Reset email sent successfully')
   }
   catch(error){
    res.status(500).send('Email not sent',error)
   }


   res.send('forgotpassword')
});


// reset password

const resetpassword = asyncHandler(async(req,res)=>{
   const {password} = req.body
   const {resetToken} = req.params

   // hash token and compare in db

   const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
   

   //find token in db

   const userToken = await Token.findOne({
    token:hashedToken,
    expiresAt:{$gt : Date.now()}

   })
   if(!userToken){
    res.status(404).send('Token expired')
   }

   //find user

   const user = await User.findOne({_id:userToken.userId})
   user.password=password
   await user.save();
   res.status(200).send('Password Resetted')
})

module.exports = {registerUser,loginUser,logoutUser,getUser, loginStatus,updateUser,changePassword,forgotPassword,resetpassword}

