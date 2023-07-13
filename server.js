const dotenv = require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const userRoute=require ('./routes/userRoutes')
const productRoute =require('./routes/productRoutes');
const contactRoute =require('./routes/contactRoutes');


const errorHandler = require ('./middleware/errorHandler');

const cookieParser = require('cookie-parser')
const path = require('path')






const app = express();


app.use(express.json())

app.use(cookieParser())

app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors({
    origin :['http://localhost:3000','https://gtinventory-app.vercel.app'],
    credentials:true
    })
);
app.use('/uploads',express.static(path.join(__dirname,'uploads')))


app.use('/users',userRoute)
app.use('/products',productRoute)

app.use('/contact',contactRoute)

app.get('/',(req,res)=>{
    res.status(200).send("home")
})


app.use(errorHandler);

const PORT = process.env.PORT || 5000;

try{

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(PORT,()=>{
        console.log(`server is connected to ${PORT}`)
    })
})
}
catch(error){
    console.log(error)
}