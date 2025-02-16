import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeSafety(url: string, metadata: any) {
  try {
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `You are an ethical AI content analyzer. Respond only in JSON format.
          Your task is to analyze URLs for harmful content and return a JSON object with the following structure:
          {
            "safe": boolean,
            "reason": "string explaining why if unsafe",
            "category": "content category if unsafe",
            "confidence": number between 0 and 1
          }`,
        },
        {
          role: "user",
          content: `Return a JSON analysis for this URL:
          URL: ${url}
          Title: ${metadata?.title || ""}
          Description: ${metadata?.description || ""}
          
          Check for: adult content, malware, phishing, hate speech, violence, illegal activities, scams.
          Return JSON only.`,
        },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    return {
      safe: result.safe ?? false,
      reason:
        result.reason || "Content appears to violate our safety guidelines",
      category: result.category || "unknown",
      confidence: result.confidence || 1.0,
    };
  } catch (error) {
    console.error("Safety analysis failed:", error);
    return {
      safe: false,
      reason:
        "Unable to verify content safety. For protection, we cannot proceed.",
      category: "verification_failed",
      confidence: 1.0,
    };
  }
}
