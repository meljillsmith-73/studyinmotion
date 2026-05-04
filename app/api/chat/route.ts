import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";

export async function POST(req: Request) {
  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error("ANTHROPIC_API_KEY is missing from your .env file");
    }

    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const { message, pdfText } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-opus-4-7", // The 2026 standard for high-level reasoning
      max_tokens: 1000,
      system: `You are an elite Socratic Research Assistant. 
      Answer the user's question based ONLY on the provided text.
      
      Your response MUST be a raw JSON object with this exact structure:
      {
        "answer": "Your detailed explanation here",
        "relevantPage": 1,
        "quote": "exactly five words"
      }

      STRICT VERBATIM RULE:
      The 'quote' field MUST contain exactly 5-6 consecutive words from the text.
      - DO NOT paraphrase (e.g., if text says 'turn away from', do not write 'turn from').
      - DO NOT fix grammar or punctuation.
      - DO NOT add a period at the end of the quote unless the quote ends with one in the PDF.
      - Match capitalization exactly.
      
      If the quote is not 100% identical to the PDF text, the user's highlight will fail.`,
      messages: [
        { role: "user", content: `TEXT: ${pdfText}\n\nQUESTION: ${message}` }
      ]
    });

    // Extract the text content from Claude
    const rawContent = response.content[0].type === "text" ? response.content[0].text : "";
    
    // Find and repair the JSON block
    const s = rawContent.indexOf('{');
    const e = rawContent.lastIndexOf('}');
    
    if (s !== -1 && e !== -1) {
      const jsonString = rawContent.substring(s, e + 1);
      const cleanJson = JSON.parse(jsonrepair(jsonString));
      return NextResponse.json(cleanJson);
    }
    
    // Fallback if Claude sends a non-JSON response
    return NextResponse.json({ 
      answer: rawContent, 
      relevantPage: null, 
      quote: null 
    });

  } catch (error: any) {
    console.error("DETAILED CHAT ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}