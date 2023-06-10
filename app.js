const ejs=require('ejs');
const bodyParser=require('body-parser');
const express=require('express');
const multer = require('multer');
const path= require('path');
const mongoose=require("mongoose");
let app=express();
var Email_value;
// var email_value;
var image_particular_user_array=[];

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/images');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({ storage: storage }).single('images');

mongoose.connect("mongodb://127.0.0.1:27017/UserDB", { useNewUrlParser: true });//database name changed to userdb
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine',ejs) ; 
app.use(express.static("public"));
//schema
const imageSchema=new mongoose.Schema({
    imageName:String,
    caption:String
});
//schema to store user info
const userInfo=new mongoose.Schema({
    name:String,
    phoneNo:Number,
    email:String,
    password:String,
    imageuploded:[imageSchema]
});
//model
const imageData=new mongoose.model("imageData",imageSchema);
const userData=new mongoose.model("userData",userInfo);

app.get("/",function(req,res){
    res.render("signup.ejs");
});
app.get("/upload",(req,res)=>{
    res.render("upload.ejs");
});

app.get("/navbar",function(req,res){
    // console.log(Email_value);
    userData.findOne({email:Email_value}).then(function(result){
        var count=result.imageuploded.length;
        console.log(result);
        console.log(result.imageuploded.length); 
        // console.log(result[1].imageName);
        res.render("navbar.ejs",{count:count,Result:result.imageuploded});
    }).catch(function(err){
      console.log(err);
    });
   
})

app.get("/profile",function(req,res){
        userData.findOne({email:Email_value}).then(function(r){
            var count=r.imageuploded.length;
            console.log(r);
            console.log(r.imageuploded.length); 
            // console.log(result[1].imageName);
            res.render("profile.ejs",{count:count,Result:r.imageuploded});
        }).catch(function(err){
          console.log(err);
        });
});



app.post("/upload",upload,(req,res)=>{
   var image=req.file.originalname;
   var Caption=req.body.captions;
        
   console.log(image);
   const Image=new imageData({
         imageName:image,
         caption:Caption
   });

   Image.save().then(function(){
    console.log("saved succesfully")
    res.redirect("/navbar");
   }).catch(function(err){
    console.log(err);
   });

 //inserting image uplode data into user info collection
image_particular_user_array.push(Image);
userData.findOneAndUpdate({email:Email_value}, { imageuploded:image_particular_user_array }).then(function(){
                console.log("successfully inserted the image data into user data");
            }).catch(function(err){
                console.log("error in update function");
                console.log(err);
            });

})




app.get("/login",function(req,res){
    res.render("login.ejs");
  });

  //check if mail and password mathches from our database
app.post("/login",function(req,res){
    
        Email_value=req.body.email;
        // email_value=req.body.email;
         userData.findOne({email:req.body.email}).then(function(result){
            
            pass=req.body.password;
            if(result.password=pass)
            {
                console.log("login successfully");
                res.redirect("/navbar");
            }
            else
            {
                console.log("wrong password");
            }
        }).catch(function(err){
            console.log(err);
            res.redirect("/");
        });
       
})

app.post('/',function(req,res){
    Email_value=req.body.email;
    const  newUser=new userData({
        name:req.body.fullname,
        phoneNo:req.body.phonenumber,
        email:req.body.email,
        password:req.body.password
    });
     newUser.save().then(function(){
        console.log("user data successfully saved");
     }).catch(function(err){
         console.log(err);
     })
    res.redirect("/navbar");
});

app.listen(3000,function(){
    console.log("server is running on port 3000");
})

