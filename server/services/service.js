import { processWithLLM } from "../workflow/llm.js";
import { routeRequest } from "../workflow/routingDecision.js";

export const workflow = async (req, res) => {
    const { title, description } = req.body ?? {};
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "title and description are required" });
    }

    const llmOutput = await processWithLLM({ title, description });
    const result = routeRequest(llmOutput);
    
    res.json(result);
}