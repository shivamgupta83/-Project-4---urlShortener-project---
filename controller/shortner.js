const urlModel = require("../models/urlModel");
const shortId = require("shortid");
const validUrl = require("valid-url");
const axios = require("axios");
const redis = require("redis");

const redisClient = redis.createClient({
  url : "redis://default:woLmeRE9mgOr11J8ZNCXNdxQQGU3yCKX@redis-13576.c264.ap-south-1-1.ec2.cloud.redislabs.com:13576"
});


redisClient.connect(console.log("Connected to Redis..."))



const shortUrl= async(req,res)=>{

try{
  const data= req.body;
if(!data) return res.status(400).send({status:false,msg:"data is not present in body"})
if(Object.keys(data).length==0) return res.status(400).send({status:false,msg:"data is not present in body"})

let {longUrl}=data;

if (!validUrl.isUri(longUrl))
return res.status(400).send({ status: false, message: "provided longUrl is invalid" });


 /*---------------------------Check Url exist or not----------------------------------*/

 let checkUrlExistence = await axios.get(longUrl)
 .then(() => longUrl)
 .catch(() => null);
 if (!checkUrlExistence)return res.status(404).send({ status: false, message: "currently this url is not exist" });


 /*--------------------get data from redis(cache) server----------------------*/

 let cachedData = await redisClient.get(longUrl);
 if (cachedData) {return res.status(200).send({status:true,Data:"redis" ,data:JSON.parse(cachedData)})} //convert into JSON

 let longUrlFound = await urlModel.findOne({ longUrl: longUrl }).select({ urlCode: 1, longUrl: 1, shortUrl: 1, _id: 0 });
    if (longUrlFound)return res.status(200).send({ status: true, data: longUrlFound });
 
    /*---------------------------Generate random short alpha-num-characters----------------------------------*/

 const genShortUrl = shortId.generate().toLowerCase();

 /*-------------------------Assigning data to req body------------------------------------*/

 req.body.urlCode = genShortUrl;
 req.body.shortUrl = `http://localhost:3000/${genShortUrl}`;

 /*---------------------------Creating data----------------------------------*/
 let createData = await urlModel.create(req.body);

 /*---------------------------Creating a custom object to match response----------------------------------*/
 let obj = {
   urlCode: createData.urlCode,
   longUrl: createData.longUrl,
   shortUrl: createData.shortUrl,
 }

 /*--------------------set data to redis(cache) server----------------------*/

 await redisClient.setEx(longUrl,24*60*60,JSON.stringify(obj)); //convert into string & set expire 60 seconds
 return res.status(201).send({ status: true, data: obj });  }
 catch(err){
return res.status(500).send({status:false,msg:err.message})
 }

}



const getLongUrlData=async(req,res)=>{

try
  {
    const urlCode = req.params.urlCode;

let cachedData =await redisClient.get(urlCode);

if(cachedData) return res.status(302).redirect(JSON.parse( cachedData ));

const wholeData= await urlModel.findOne({urlCode})
if(!wholeData) return res.sendStatus(404).send({status:false,msg:"url code is not valid plese enter write data"})

await redisClient.setEx(urlCode,60*60,JSON.stringify(wholeData.longUrl))
console.log(wholeData)
return res.status(302).redirect(wholeData.longUrl)

}
catch(err){
 return res.status(500).send({message:err.message})
}
}


module.exports={shortUrl,getLongUrlData};




