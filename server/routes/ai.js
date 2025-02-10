import { Router } from "express";
import { fetchOptimizedResponse } from "../controllers/ai.js";

const router=Router()

router.route("/").get((req,res)=>{
    res.status(200).json({
        success:true,
        message:"ai is working"
    })
}).post(fetchOptimizedResponse)


export default router