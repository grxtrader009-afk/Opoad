import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Type } from "@google/genai";

// Shared server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

export interface VideoIdea {
  title: string;
  angle: string;
  hook: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  bodyPoints: string[];
  transitions: string[];
  outro: string;
  fullText: string;
}

// Server function to generate multiple creative video ideas/angles
export const generateVideoIdeas = createServerFn({ method: "POST" })
  .validator(
    (data: { title: string; summary?: string; source?: string; language: string; tone: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGeminiClient();
      const prompt = `
You are an expert AI Video Producer and News Analyst for OPOAD (Global AI News & Creator Platform).
Analyze the following news item and generate 5 highly engaging, viral video ideas/angles suitable for short-form or long-form creators.

News Item:
Title: ${data.title}
Summary: ${data.summary || "No summary available"}
Source: ${data.source || "Unknown"}

Target Settings:
Language: ${data.language} (English, Hindi, or Hinglish - hybrid Hindi/English using Roman characters)
Tone: ${data.tone} (Serious, Fun, or Motivational)

For each of the 5 video ideas, provide:
1. A viral Title.
2. A creative Angle (why this works, context, or visual concept).
3. A compelling Hook (first 3-5 seconds verbal prompt).

Produce the response in structured JSON matching this schema:
An array of objects, where each object has "title", "angle", and "hook" properties.
All text in the generated ideas should strictly respect the requested language (${data.language}) and tone (${data.tone}).
`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                angle: { type: Type.STRING },
                hook: { type: Type.STRING },
              },
              required: ["title", "angle", "hook"],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from Gemini API");
      }

      const ideas = JSON.parse(text) as VideoIdea[];
      return { ideas };
    } catch (error: unknown) {
      console.error("[generateVideoIdeas] Server function error:", error);
      const errMsg = error instanceof Error ? error.message : "Failed to generate video ideas.";
      throw new Error(errMsg);
    }
  });

export interface AiQueryResult {
  response: string;
}

// Server function to process a free-form prompt/query from the Describe Box
export const processAiQuery = createServerFn({ method: "POST" })
  .validator(
    (data: { query: string; deepThink?: boolean; researchMode?: boolean }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGeminiClient();

      const modeInstructions = [
        data.researchMode
          ? "Engage deep research mode: cross-reference evidence, cite specific data points, and provide structured analytical insights."
          : "",
        data.deepThink
          ? "Engage deep reasoning mode: think step-by-step, evaluate multiple perspectives, and provide a thorough, well-structured response."
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      const prompt = `You are the OPOAD AI Operating System core — an advanced intelligence, automation, and content creation engine.

User Query:
${data.query}

${modeInstructions}

Respond with a clear, structured, and actionable answer. If the query asks for a script, format it with [HOOK], [BODY], and [OUTRO] sections. If it asks for research, provide structured bullet points with key findings. If it asks for analysis, give a concise executive summary followed by detailed breakdown. Always be professional and insightful.`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from AI service");
      }

      return { response: text };
    } catch (error: unknown) {
      console.error("[processAiQuery] Server function error:", error);
      const errMsg = error instanceof Error ? error.message : "Failed to process AI query.";
      throw new Error(errMsg);
    }
  });

export interface NewsAnalysis {
  summary: string;
  explanation: string;
  background: string;
  whyItHappened: string;
  keyEntities: string;
  marketImpact: string;
  investorViewpoint: string;
  futurePossibilities: string;
  riskFactors: string;
  aiConclusion: string;
  youtubeScript: string;
  reelScript: string;
  analysisReport: string;
}

// Server function to generate a deep 10-point AI research report on a news item
export const analyzeNews = createServerFn({ method: "POST" })
  .validator(
    (data: { title: string; summary?: string; source?: string; category?: string }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGeminiClient();
      const prompt = `You are the OPOAD Global Intelligence Core — an elite AI news analyst.
Perform a deep research analysis on the following news item.

News Item:
Title: ${data.title}
Summary: ${data.summary || "No summary available"}
Source: ${data.source || "Unknown"}
Category: ${data.category || "General"}

Produce a comprehensive JSON response with these exact fields:
{
  "summary": "A concise 2-3 sentence news summary",
  "explanation": "Complete explanation of what happened, 3-4 sentences",
  "background": "Background history and context leading to this event, 3-4 sentences",
  "whyItHappened": "Analysis of why this happened — root causes and triggers, 2-3 sentences",
  "keyEntities": "Companies and people involved, with brief roles",
  "marketImpact": "Expected market impact assessment with a score from 1-10 and reasoning",
  "investorViewpoint": "What this means for investors — opportunities and warnings",
  "futurePossibilities": "Future possibilities and scenarios this could lead to",
  "riskFactors": "Key risk factors and downside scenarios",
  "aiConclusion": "Final AI conclusion and strategic recommendation",
  "youtubeScript": "A 60-second YouTube video script with [HOOK], [BODY], [OUTRO] sections covering this news",
  "reelScript": "A 30-second short reel/shorts script optimized for vertical video",
  "analysisReport": "A formatted professional analysis report with headers and bullet points"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              explanation: { type: Type.STRING },
              background: { type: Type.STRING },
              whyItHappened: { type: Type.STRING },
              keyEntities: { type: Type.STRING },
              marketImpact: { type: Type.STRING },
              investorViewpoint: { type: Type.STRING },
              futurePossibilities: { type: Type.STRING },
              riskFactors: { type: Type.STRING },
              aiConclusion: { type: Type.STRING },
              youtubeScript: { type: Type.STRING },
              reelScript: { type: Type.STRING },
              analysisReport: { type: Type.STRING },
            },
            required: [
              "summary",
              "explanation",
              "background",
              "whyItHappened",
              "keyEntities",
              "marketImpact",
              "investorViewpoint",
              "futurePossibilities",
              "riskFactors",
              "aiConclusion",
              "youtubeScript",
              "reelScript",
              "analysisReport",
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from Gemini API");
      }

      const analysis = JSON.parse(text) as NewsAnalysis;
      return { analysis };
    } catch (error: unknown) {
      console.error("[analyzeNews] Server function error:", error);
      const errMsg = error instanceof Error ? error.message : "Failed to analyze news.";
      throw new Error(errMsg);
    }
  });

// Server function to generate a detailed, structured creator script
export const generateScript = createServerFn({ method: "POST" })
  .validator(
    (data: {
      title: string;
      summary?: string;
      videoTitle: string;
      angle: string;
      language: string;
      tone: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const ai = getGeminiClient();
      const prompt = `
You are an elite scriptwriter for a global news & content creation platform.
Draft a highly professional, engaging teleprompter script for a video.

Base News Context:
News Headline: ${data.title}
News Summary: ${data.summary || ""}

Chosen Video Angle:
Video Title: ${data.videoTitle}
Angle: ${data.angle}

Creator Specifications:
Language: ${data.language} (English, Hindi, or Hinglish - Hindi-English hybrid written in Roman alphabet)
Tone: ${data.tone} (Serious, Fun, or Motivational)

Please draft a script structured into distinct sections:
1. Hook (Immediate attention grabber)
2. Body Points (3 sequential ordered key points/arguments, detailed and fluid)
3. Transitions (Smooth transitions between these points)
4. Outro & Call to Action (Engagement prompt)
5. Full Text (The complete fluid teleprompter script combined from the sections)

Output the response strictly in JSON format matching this schema:
{
  "title": "A final title for the video script",
  "hook": "The opening hook script",
  "bodyPoints": ["Point 1 script", "Point 2 script", "Point 3 script"],
  "transitions": ["Transition 1 script", "Transition 2 script"],
  "outro": "The outro and CTA script",
  "fullText": "The complete combined full script for the teleprompter"
}

All scripts must be written in the specified language (${data.language}) and match the requested tone (${data.tone}).
`;

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              bodyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              transitions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              outro: { type: Type.STRING },
              fullText: { type: Type.STRING },
            },
            required: ["title", "hook", "bodyPoints", "transitions", "outro", "fullText"],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Empty response received from Gemini API");
      }

      const script = JSON.parse(text) as GeneratedScript;
      return { script };
    } catch (error: unknown) {
      console.error("[generateScript] Server function error:", error);
      const errMsg = error instanceof Error ? error.message : "Failed to generate script.";
      throw new Error(errMsg);
    }
  });
