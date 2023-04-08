const express= require("express");
const app=express();
let route= require("./routes/route.js")
const mongoose= require("mongoose");

app.use(express.json());

mongoose.set('strictQuery', false);
mongoose.connect("mongodb+srv://123:1234@cluster0.pf4v08v.mongodb.net/project-4",{
    useNewUrlParser:true
}).then(()=>{
    console.log("moongoose is connected")
}).catch((err)=>{console.log("err :",err)})

app.use("/",route)


app.listen(3000,()=>console.log("server is connected : 3000"))