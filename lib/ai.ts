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
  attempt?: number;
  task?: string;
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
    const messages = [
      {
        role: "system",
        content: `You are an advanced AI system specialized in URL content analysis and metadata enhancement. Your core purpose is to deeply understand any web content and generate rich, meaningful metadata that captures its true essence.

Your analysis should:
- Extract and enhance the core subject matter, not just surface-level details
- Generate precise, meaningful titles that reflect the actual content
- Create detailed descriptions that capture the unique value proposition
- Identify the true purpose and target audience
- Understand technical depth and prerequisites when relevant
- Recognize practical applications and key takeaways
- Generate SEO-optimized keywords and classifications
- Determine appropriate content categorization and safety ratings

You have the capability to analyze any type of web content including articles, documentation, videos, podcasts, products, or applications. Always focus on the actual content's value and purpose, never just its format or platform.

Generate your response in the required JSON structure, ensuring each field provides meaningful, content-specific information that adds value for users.`,
      },
      {
        role: "user",
        content: `Analyze this URL's actual content:
          URL: ${aiInput.url}
          Title: ${aiInput.metadata.title}
          Description: ${aiInput.metadata.description}
          Content: ${aiInput.metadata.content || ""}

          For any website type:
          1. What specific content is shown?
          2. What can users do on this page?
          3. What information or value is provided?
          4. Who is this content actually for?
          5. What makes this page unique or useful?

          Required JSON structure:
          {
            "alias": "brief-id",
            "shortTitle": "what-this-page-is",
            "enhancedTitle": "specific-content-purpose",
            "enhancedDescription": "what-users-will-actually-find-here",
            "suggestedKeywords": [
              "specific-content-elements",
              "actual-topics-covered",
              "real-features-shown"
            ],
            "category": "specific-content-type",
            "safetyRating": "content-safety-level",
            "enhancedMetadata": {
              "subject": "main-content-area",
              "topic": "specific-focus",
              "classification": "actual-content-format",
              "language": "content-language",
              "author": "content-creator",
              "copyright": "rights-info",
              "ogType": "content-type",
              "ogSiteName": "platform-name"
            },
            "aiAnalysis": {
              "tone": "content-style",
              "contentType": "specific-format",
              "keyTakeaways": [
                "main-content-element",
                "key-feature-available",
                "primary-user-benefit"
              ],
              "technicalDepth": "content-complexity",
              "prerequisites": [
                "required-to-use",
                "needed-to-understand"
              ],
              "practicalApplications": [
                "actual-use-case",
                "real-world-application"
              ]
            },
            "targetAudience": "specific-user-type"
          }

          Examples for different content types:

          E-commerce Product:
          {
            "shortTitle": "Nike Air Max 2024",
            "enhancedTitle": "Nike Air Max 2024 Running Shoes - Performance Details",
            "enhancedDescription": "Latest Nike Air Max running shoes with responsive cushioning, mesh upper, and custom fit technology. Available in 6 colors, sizes 6-14.",
            "aiAnalysis": {
              "contentType": "Product Page",
              "keyTakeaways": [
                "New running shoe model",
                "Advanced cushioning system",
                "Multiple color options"
              ]
            }
          }

          News Article:
          {
            "shortTitle": "Tech Startup Funding",
            "enhancedTitle": "AI Startup Raises $50M Series B for Language Models",
            "enhancedDescription": "Breaking news: AI company secures major funding to develop advanced language models. Details on investors, technology, and market impact.",
            "aiAnalysis": {
              "contentType": "News Article",
              "keyTakeaways": [
                "Funding announcement",
                "Investment details",
                "Company roadmap"
              ]
            }
          }

          Dashboard:
          {
            "shortTitle": "Sales Analytics",
            "enhancedTitle": "Real-time Sales Performance Dashboard - Q1 2024",
            "enhancedDescription": "Live dashboard showing current sales metrics, revenue trends, and regional performance data with interactive charts and filters.",
            "aiAnalysis": {
              "contentType": "Analytics Dashboard",
              "keyTakeaways": [
                "Current sales data",
                "Performance metrics",
                "Regional breakdown"
              ]
            }
          }"`,
      },
    ];

    const shortcodePrompt = `
Generate a meaningful, brief alias for this URL that reflects its content.
The alias should be:
1. 4-6 characters long
2. Memorable and relevant to content
3. Only use letters and numbers
4. Lowercase preferred

Examples:
- YouTube video about cats -> "cats2"
- Tech blog about AI -> "ai4dev"
- News article about space -> "space1"
- Product page for shoes -> "shoe5"
`;

    if (aiInput.task === "shortcode") {
      messages.push({
        role: "user",
        content: shortcodePrompt + `\nURL: ${aiInput.url}\n`,
      });
    }

    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: messages,
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
