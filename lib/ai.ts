import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error(
    "Missing Groq API key. Please set GROQ_API_KEY in your environment variables."
  );
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface AIInput {
  url: string;
  metadata: {
    title: string;
    description: string;
  };
}

interface AIOutput {
  alias: string;
  shortTitle: string;
  enhancedTitle: string;
  enhancedDescription: string;
  suggestedKeywords: string[];
}

interface ParsedContent {
  alias?: string;
  shortTitle?: string;
  enhancedTitle?: string;
  enhancedDescription?: string;
  suggestedKeywords?: string[];
}

export async function generateAIAlias(url: string): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content:
            "Generate a short, memorable alias for a URL. Make it relevant to the content but keep it under 15 characters.",
        },
        {
          role: "user",
          content: `Generate a short alias for this URL: ${url}`,
        },
      ],
    });

    return (completion.choices[0]?.message.content ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  } catch (error) {
    console.error("AI alias generation failed:", error);
    return "";
  }
}

export async function generateAIContent(
  aiInput: AIInput & { attempt?: number }
): Promise<AIOutput | null> {
  try {
    const attemptPrompt = aiInput.attempt
      ? `This is attempt ${aiInput.attempt}. Please generate a different alias than previous attempts.`
      : "";

    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `You are a JSON-only response AI. Always format your response as valid JSON, no matter what. Never include explanatory text outside the JSON structure.`,
        },
        {
          role: "user",
          content: `Generate metadata for this URL in strict JSON format:
            URL: ${aiInput.url}
            Original Title: ${aiInput.metadata.title}
            Original Description: ${aiInput.metadata.description}
            ${attemptPrompt}

            Required JSON structure:
            {
              "alias": "short-name",
              "shortTitle": "concise-title",
              "enhancedTitle": "full-title",
              "enhancedDescription": "description",
              "suggestedKeywords": ["keyword1", "keyword2"]
            }

            Rules:
            - Response must be valid JSON only
            - No text outside JSON structure
            - No explanations or comments
            - alias: max 20 chars, must be unique and different from previous attempts
            - shortTitle: 30-50 chars
            - Never use generic values like "Generated Title" or "Error"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    let parsedContent: ParsedContent;
    try {
      parsedContent = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      );
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      return null;
    }

    return {
      alias:
        parsedContent?.alias
          ?.toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "") || "",
      shortTitle: parsedContent?.shortTitle || "",
      enhancedTitle: parsedContent?.enhancedTitle || aiInput.metadata.title,
      enhancedDescription:
        parsedContent?.enhancedDescription || aiInput.metadata.description,
      suggestedKeywords: Array.isArray(parsedContent?.suggestedKeywords)
        ? parsedContent.suggestedKeywords
        : [],
    };
  } catch (error) {
    console.error("AI generation failed:", error);
    return null;
  }
}
