const express=require("express");
const router=express.Router();
const {shortUrl,getLongUrlData}=require("../controller/shortner.js");

router.get("/longurl/:urlCode",getLongUrlData);

router.post("/url/sorten",shortUrl);

module.exports=router;