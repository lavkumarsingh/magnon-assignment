import { Router } from "express";
import { workflow } from "../services/service.js";

const router = Router();

router.post('/processWithLLM', workflow);
router.get('/', (req, res) => {
    res.json({
        message: "running"
    })
})
export default router;