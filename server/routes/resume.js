import { Router } from "express";
import { create_resume} from "../controllers/resume.js";

const router=Router()

router.post("/new",create_resume)

export default router
