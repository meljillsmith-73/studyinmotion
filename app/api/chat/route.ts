import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";

export async function POST(req: Request) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("API Key is missing from .env");

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const { message, pdfText } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7", 
      max_tokens: 600,
      system: `Answer based ONLY on the text. Return JSON: {"answer": "...", "relevantPage": 1, "quote": "..."}`,
      messages: [{ role: "user", content: `TEXT: ${pdfText}\n\nQUESTION: ${message}` }]
    });

    const rawContent = response.content[0].type === "text" ? response.content[0].text : "";
    const s = rawContent.indexOf('{');
    const e = rawContent.lastIndexOf('}');
    
    if (s !== -1 && e !== -1) {
      const cleanJson = JSON.parse(jsonrepair(rawContent.substring(s, e + 1)));
      return NextResponse.json(cleanJson);
    }
    return NextResponse.json({ answer: rawContent, relevantPage: null, quote: null });

  } catch (error: any) {
    // This logs the SPECIFIC error to your VS Code terminal
    console.error("DETAILED CHAT ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}