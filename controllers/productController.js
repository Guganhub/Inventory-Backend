const asyncHandler = require('express-async-handler')
const Product = require('../models/productModel')
const {fileSizeFormatter} = require('../utils/fileUpload')
const cloudinary = require('cloudinary').v2





const createProduct = asyncHandler(async(req,res)=>{
    const {name,sku,category,quantity,price,description}= req.body


    // validation

    if(!name || !category || !quantity || !price || !description){
        res.status(400).send('Please fill all the fields')
    }

    // handle image upload

    let fileData = {}
    if(req.file){

        let uploadToCloud;
        try{
            uploadToCloud = await cloudinary.uploader.upload(req.file.path, {folder : 'Products',resource_type:'image'})
        }
        catch(error){
            res.status(500).send('Image could not be uploaded',error)
        }
        fileData={
            fileName: req.file.originalname,
            filePath: uploadToCloud.secure_url,
            fileType : req.file.mimetype,
            fileSize : fileSizeFormatter(req.file.size,2),
        }
    }


    // create product

    const product = await Product.create({
        user : req.user.id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image:fileData
    })
    res.status(201).send(product);
})  

// get all products

const getAllProducts = asyncHandler(async(req,res)=>{
    const products = await Product.find({user:req.user.id}).sort('-createdAt');
    console.log(products)
    res.status(200).send(products)
})

//get single product

const getSingleProduct = asyncHandler(async(req,res)=>{
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(400).send('Product not found')
    }

    if(product.user.toString()!== req.user.id){
        res.status(401).send('User not authorized')
    }
    res.status(200).send(product)
})

//delete product

const deleteProduct = asyncHandler(async(req,res)=>{
   
    const product = await Product.findById(req.params.id)
    if(!product){
        res.status(400).send('Product not found')
    }
   

    if(product.user.toString()!=req.user.id){
        res.status(401).send('User not authorized')
    }
    // await product.remove(req.params.id);
    // res.status(200).send('product removed')
    await Product.deleteOne({_id:req.params.id})
    res.status(200).send(product)
})


// update product

const updateProduct = asyncHandler(async(req,res)=>{
    const {name,category,quantity,price,description}= req.body


    const {id}=req.params
    // console.log(id)

    const product = await Product.findById(id)

    if(!product){
        res.status(400).send('Product not found')
    }

    if(product.user.toString()!=req.user.id){
        res.status(401).send('User not authorized')
    }
 

    // handle image upload

    let fileData = {}
    if(req.file){

        let uploadToCloud;
        try{
            uploadToCloud = await cloudinary.uploader.upload(req.file.path, {folder : 'Products',resource_type:'image'})
        }
        catch(error){
            res.status(500).send('Image could not be uploaded',error)
        }
        fileData={
            fileName: req.file.originalname,
            filePath: uploadToCloud.secure_url,
            fileType : req.file.mimetype,
            fileSize : fileSizeFormatter(req.file.size,2),
        }
    }


    // update product


    const updatedProduct = await Product.findByIdAndUpdate(
        { _id:id},
        
        
        
        {
            name ,
            category,
            quantity,
            price,  
            description,
            image:Object.keys(fileData).length===0 ? product.image : fileData
        },
        {
            new : true,
            runValidators: true
        }
        
        
        )

    
    res.status(200).send(updatedProduct);
    console.log(updatedProduct)
})  



module.exports={createProduct,getAllProducts,getSingleProduct,deleteProduct,updateProduct}