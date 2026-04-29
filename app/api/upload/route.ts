import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";

export const runtime = "nodejs";
export const maxDuration = 60; 

export async function POST(req: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return NextResponse.json({ error: "API Key missing" }, { status: 500 });

  try {
    const anthropic = new Anthropic({ apiKey: anthropicKey });
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const existingKnowledge = formData.get("existingKnowledge") || "None";
    
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = await put(file.name, buffer, { access: "public" });

    const pdfParse = require("pdf-parse-fixed");
    const parsedPdf = await pdfParse(buffer);
    const cleanText = parsedPdf.text.substring(0, 18000); 

    const aiResponse = await anthropic.messages.create({
      model: "claude-opus-4-7", // Updated to the 2026 Flagship
      max_tokens: 4000, 
      system: "You are a Research Synthesis Engine. You MUST return ONLY a raw JSON object. No conversational text, no markdown code blocks.",
      messages: [{
        role: "user",
        content: `Analyze this paper. 
        EXISTING LIBRARY: ${existingKnowledge}
        TEXT: ${cleanText}

        Return this EXACT JSON structure:
        {
          "startPage": number,
          "physicalOffset": number,
          "sections": [{"title": "string", "text": "string", "page": number, "anchorQuote": "string"}],
          "mcqs": [{"question": "string", "options": ["string"], "answer": "string"}],
          "graph": { 
             "nodes": [{"id": "string", "label": "string", "page": number, "insight": "string"}], 
             "crossLinks": [{"sourceLabel": "string", "targetLabel": "string", "reason": "string"}] 
           }
        }`
      }]
    });

    const rawContent = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";
    
    // BULLETPROOF EXTRACTION: Find the first { and the last }
    const startIndex = rawContent.indexOf('{');
    const endIndex = rawContent.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("AI failed to return a valid JSON object.");
    }

    const jsonString = rawContent.substring(startIndex, endIndex + 1);
    const data = JSON.parse(jsonrepair(jsonString));

    return NextResponse.json({ 
      success: true, 
      pdfUrl: blob.url, 
      fileName: file.name, 
      fileId: Math.random().toString(36).substring(7), 
      ...data 
    });
  } catch (error: any) {
    console.error("Server Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}