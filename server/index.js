import "dotenv/config.js";
import express from "express";
import cors from "cors";
import router from "./routes/workflow.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
})
