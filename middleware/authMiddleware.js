const asyncHandler = require('express-async-handler')

const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const protect = asyncHandler(async(req,res,next)=>{
    try{
        const token = req.cookies.token
        // console.log(token)
        if(!token){
            res.status(401).send('Not Authorized')
        }

        // verify token

        const verify = jwt.verify(token, process.env.JWT_SECRET)
        // get user id from token

       const user = await User.findById(verify.id).select('-password')

        if(!user){
            res.status(400).send('User not found')
        }

        req.user = user
        next()
    }
    catch(error){
        res.status(401).send('Not Authorized')
    }
})

module.exports = protect