import 'dotenv/config'
import express from "express";
import fetch from "node-fetch";
const app = express();
const port = process.env.PORT || 5000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.render("index", {
        corrected: "",
        originalText: "",
    });
})
app.post("/correct", async (req, res) => {
    const text = req.body.text.trim();
    if (!text) {
        return res.render("index", {
            corrected: "Please enter some text to correct.",
            originalText: text,
        });
    }
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "You are a helpful grammar correction assistant. Only return the corrected text without explanations." },
                    { role: "user", content: `Correct the grammar and spelling in this text: ${text}` },
                ],
                max_tokens: 200,
                temperature: 0.3,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            return res.render("index", {
                corrected: "Error: Unable to process. Please try again.",
                originalText: text,
            });
        }
        const data = await response.json();
        const correctedText = data.choices[0].message.content;
        return res.render("index", {
            corrected: correctedText,
            originalText: text,
        });
    } catch (error) {
        console.error("Error:", error);
        return res.render("index", {
            corrected: "Error: Please try again later.",
            originalText: text,
        });
    }
})
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
