const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name : {
        type:String,require: [true, 'Please add your name']
    },
    email:{
        type:String, require:[true, 'Please add your email'],
        unique:true,
        trim:true,
        match:[
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please add a valid email"
        ]
    },
    password:{
        type:String,
        require:[true,'Please add a password'],
        minlength:[6,'Password must be six character long'],
       // maxlength:[10,'Password must not exceed 10 characters']
    },
    image:{
        type:String,
        require:[true,"Please insert a photo"],
        default:"https://i.ibb.co/4pDNDk1/avatar.png"
    },
    mobile:{
        type:String,
        require:[true,"Please add a mobile number"],
        default:"+91"

    },
    
},{
    timestamps:true,
})

// password encryption

userSchema.pre('save',async function(next){


    if(!this.isModified('password')){
        return next();
    }
    //hash password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password,salt);
    this.password = hashedPassword
    next();
})

const User = mongoose.model('User',userSchema)


module.exports=User;
