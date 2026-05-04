import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";

export const runtime = "nodejs";
export const maxDuration = 60; 

function sanitizeContent(text: string): string {
  const legalNoise = [
    /Copyright Warning Notice/gi,
    /material is protected by copyright/gi,
    /educational purposes of the University/gi,
    /solely for the educational purposes/gi,
    /Failure to comply with the terms/gi,
    /expose you to legal action/gi,
    /reproduce or distribute any part/gi
  ];
  let clean = text;
  legalNoise.forEach(pattern => {
    clean = clean.replace(pattern, "");
  });
  return clean.trim();
}

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
    const filteredText = sanitizeContent(parsedPdf.text).substring(0, 20000); 

    const aiResponse = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4000, 
      system: `You are a Research Synthesis Engine. Ignore all legal/copyright notices. Return ONLY a raw JSON object.`,
      messages: [{
        role: "user",
        content: `Analyze this paper. 
        TEXT: ${filteredText}
        Return this EXACT JSON:
        {
          "startPage": number,
          "physicalOffset": number,
          "sections": [{"title": "string", "text": "string", "page": number, "anchorQuote": "string"}],
          "mcqs": [{"question": "string", "options": ["string"], "answer": "string"}],
          "graph": { "nodes": [{"id": "string", "label": "string", "page": number, "insight": "string"}], "crossLinks": [] }
        }`
      }]
    });

    const rawContent = aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "";
    const startIndex = rawContent.indexOf('{');
    const endIndex = rawContent.lastIndexOf('}');
    const jsonString = rawContent.substring(startIndex, endIndex + 1);
    const data = JSON.parse(jsonrepair(jsonString));

    return NextResponse.json({ success: true, pdfUrl: blob.url, fileName: file.name, fileId: Math.random().toString(36).substring(7), ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}