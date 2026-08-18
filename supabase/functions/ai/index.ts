// ==============================================================================
// Supabase Edge Function: /functions/ai
// Provider-abstracted AI Gateway (Gemini / OpenAI)
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export interface TranslationResult {
  word_en: string;
  word_th: string;
  part_of_speech: "noun" | "verb" | "adj" | "adv" | "other" | "gerund" | "past_participle";
  example_sentence_en: string;
  example_sentence_th: string;
}

export interface AIProvider {
  translate(word: string, fromLang?: string, toLang?: string): Promise<TranslationResult>;
  extractTextFromImage(base64Image: string, mimeType: string): Promise<string>;
  generateExample(word: string, partOfSpeech: string): Promise<{ example_en: string; example_th: string }>;
}

// ------------------------------------------------------------------------------
// Gemini Implementation
// ------------------------------------------------------------------------------
class GeminiProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(word: string): Promise<TranslationResult> {
    const prompt = `You are an expert English-Thai bilingual dictionary and language tutor for students aged 10-17.
Given the English word or phrase: "${word}", provide:
1. The most natural, accurate Thai translation.
2. The primary part of speech ("noun", "verb", "adj", "adv", "gerund", "past_participle", or "other").
3. A simple, educational example sentence in English demonstrating the word.
4. The Thai translation of that example sentence.

Respond ONLY with valid JSON in this exact structure without markdown formatting or code fences:
{
  "word_en": "${word}",
  "word_th": "คำแปลภาษาไทย",
  "part_of_speech": "noun",
  "example_sentence_en": "Example sentence here.",
  "example_sentence_th": "ประโยคตัวอย่างภาษาไทยที่นี่"
}`;

    const res = await fetch(
      `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("No response content received from Gemini.");
    }

    try {
      const parsed: TranslationResult = JSON.parse(candidateText.trim());
      return parsed;
    } catch {
      // Fallback regex extraction if raw json formatting was wrapped
      const cleanJson = candidateText.replace(/^```json/, "").replace(/```$/, "").trim();
      return JSON.parse(cleanJson);
    }
  }

  async extractTextFromImage(base64Image: string, mimeType: string): Promise<string> {
    const prompt = `Extract the main English or Thai vocabulary word or short phrase visible in this image.
Return ONLY the extracted word or phrase as plain text. Do not include any explanations, quotes, or punctuation.`;

    const res = await fetch(
      `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: base64Image.replace(/^data:image\/[a-z]+;base64,/, ""),
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini OCR API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return candidateText.trim();
  }

  async generateExample(word: string, partOfSpeech: string): Promise<{ example_en: string; example_th: string }> {
    const prompt = `Generate a simple, clear educational example sentence in English using the ${partOfSpeech} "${word}" suitable for students, and provide its Thai translation.
Respond ONLY with JSON:
{
  "example_en": "...",
  "example_th": "..."
}`;

    const res = await fetch(
      `${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return JSON.parse(text.trim());
  }
}

// ------------------------------------------------------------------------------
// Edge Function Request Handler
// ------------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate incoming request via Supabase Auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Initialize AI Provider
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || "";
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured on Edge Function" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provider: AIProvider = new GeminiProvider(geminiApiKey);

    // 3. Route actions
    const url = new URL(req.url);
    const pathname = url.pathname.replace(/\/$/, "");

    const body = await req.json();

    if (pathname.endsWith("/translate") || body.action === "translate") {
      const { word } = body;
      if (!word || typeof word !== "string") {
        return new Response(JSON.stringify({ error: "Missing required 'word' parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await provider.translate(word.trim());
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pathname.endsWith("/ocr") || body.action === "ocr") {
      const { image, mimeType } = body;
      if (!image) {
        return new Response(JSON.stringify({ error: "Missing required 'image' (base64) parameter" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const extractedText = await provider.extractTextFromImage(image, mimeType || "image/jpeg");
      return new Response(JSON.stringify({ text: extractedText }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (pathname.endsWith("/example") || body.action === "example") {
      const { word, partOfSpeech } = body;
      const result = await provider.generateExample(word, partOfSpeech || "noun");
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action or endpoint" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
