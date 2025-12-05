import express from "express";
import Groq from "groq-sdk";

const aiRouter = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

aiRouter.post("/chat", async (req, res) => {
  try {
    const { carData, message } = req.body;

    const prompt = `
You are a car rental assistant. Answer only using this car's data.

Car Brand: ${carData.brand}
Model: ${carData.model}
Seats: ${carData.seating_capacity}
Fuel Type: ${carData.fuel_type}
Transmission: ${carData.transmission}
Location: ${carData.location}
Price Per Day: ${carData.pricePerDay}
Availability: ${carData.isAvaliable ? "Available" : "Not Available"}

User Question: ${message}
`;

    const completion = await groq.chat.completions.create({
     model: "llama-3.1-8b-instant",  // ✅ FREE MODEL
      messages: [
        { role: "system", content: "You are a helpful car assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const reply = completion.choices[0].message.content;

    res.json({ success: true, reply });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: "AI Error" });
  }
});

export default aiRouter;
