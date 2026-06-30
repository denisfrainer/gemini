import { GoogleGenAI } from "@google/genai";
import type { Config, Context } from "@netlify/functions";
import sharp from "sharp";
import path from "path";

// Prompt templates for Avatar themes
const THEME_PROMPTS: Record<string, string> = {
  linkedin: "Create a professional corporate headshot avatar of the person in the selfie. They should be wearing a sleek dark suit/blazer over a clean shirt, with professional studio lighting and a neutral, slightly blurred background (corporate office style). Maintain facial features and hair details from the selfie for consistency, rendering in a photorealistic, high-fidelity business portrait style.",
  warrior: "Create an epic medieval warrior avatar of the person in the selfie. They should be clad in highly detailed metallic plates and leather armor with ornate engravings. The background should be a majestic misty fantasy castle gate or a battlefield at twilight. Cinematic lighting, heroic pose, maintaining consistency of the person's face and hair from the selfie.",
  space: "Create a stunning astronaut avatar of the person in the selfie. They should be wearing a detailed white spacesuit with glowing indicators, with a reflection of stars, distant nebulas, and galaxies on their helmet visor. The background is the deep black cosmos with stellar dust. Majestic outer space cinematic lighting, maintaining consistency of the person's face from the selfie."
};

const WATERMARK_BASE64 = "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";

export default async (req: Request, context: Context) => {
  // CORS Preflight request handling
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let theme = "";
  let selfieBase64 = "";
  let selfieMimeType = "image/jpeg";

  try {
    const body = await req.json();
    theme = body.theme;
    selfieBase64 = body.selfie; // Base64 string from browser

    if (!theme || !selfieBase64) {
      return new Response(JSON.stringify({ error: "Missing required fields: theme or selfie" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Strip out base64 prefixes if present (e.g. data:image/png;base64,)
    const match = selfieBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      selfieMimeType = match[1];
      selfieBase64 = match[2];
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Phase 4: Observability [AVATAR_API_START]
  console.log(`[AVATAR_API_START] Selected theme: ${theme}, Image payload size: ${selfieBase64.length} characters.`);

  const prompt = THEME_PROMPTS[theme];
  if (!prompt) {
    console.error(`[AVATAR_API_ERROR] Theme '${theme}' not found in templates.`);
    return new Response(JSON.stringify({ error: `Invalid theme selected: ${theme}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[AVATAR_API_ERROR] GEMINI_API_KEY is not defined in environment variables.");
    return new Response(JSON.stringify({ error: "API configuration error. GEMINI_API_KEY is missing." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Phase 3.2: Initialize the Gemini client mapping to user's desired style
    const genai = { Client: GoogleGenAI };
    const client = new genai.Client({ apiKey });

    // Phase 3.3 & Phase 4: Call client.interactions.create with try-catch
    const interaction = await client.interactions.create({
      model: "gemini-3.1-flash-image",
      input: [
        {
          type: "image",
          data: selfieBase64,
          mime_type: selfieMimeType,
        },
        {
          type: "text",
          text: prompt,
        },
      ],
      response_format: {
        type: "image",
        aspect_ratio: "1:1",
        image_size: "1K",
      },
    });

    // Extract the generated image data
    let generatedImageBase64 = "";
    if (interaction.output_image && interaction.output_image.data) {
      generatedImageBase64 = interaction.output_image.data;
    }

    if (!generatedImageBase64) {
      throw new Error("The model did not return any image data in its output_image.");
    }

    // Load and apply the watermark using sharp
    let watermarkedImageBase64 = "";
    try {
      const imageBuffer = Buffer.from(generatedImageBase64, 'base64');
      const watermarkBuffer = Buffer.from(WATERMARK_BASE64, 'base64');

      console.log('[WATERMARK_DEBUG] Tiling pre-rendered base64 watermark pattern.');

      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{ 
          input: watermarkBuffer, 
          tile: true, 
          blend: 'over' 
        }])
        .toBuffer();
        
      watermarkedImageBase64 = watermarkedBuffer.toString('base64');
    } catch (sharpError) {
      console.error("[AVATAR_API_ERROR] Sharp watermarking failed:", sharpError);
      // Fallback to un-watermarked image if watermarking fails so we don't break the user flow
      watermarkedImageBase64 = generatedImageBase64;
    }

    // Phase 4: Observability [AVATAR_API_SUCCESS]
    console.log(`[AVATAR_API_SUCCESS] Interaction ID: ${interaction.id || "N/A"}, Generated image data length: ${watermarkedImageBase64.length} characters (original: ${generatedImageBase64.length}).`);

    return new Response(JSON.stringify({ image: watermarkedImageBase64 }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    // Phase 4: Observability [AVATAR_API_ERROR]
    console.error("[AVATAR_API_ERROR] Details:", error.message, error.stack);

    // Phase 4.1: Safety Block Catch
    const errorText = error.message?.toLowerCase() || "";
    const isSafetyOrBlocked =
      errorText.includes("safety") ||
      errorText.includes("policy") ||
      errorText.includes("block") ||
      errorText.includes("violate") ||
      errorText.includes("recitation");

    if (isSafetyOrBlocked) {
      return new Response(
        JSON.stringify({
          error: "Nossa IA achou essa foto um pouco complexa para o tema. Tente outra selfie com o rosto mais iluminado!",
        }),
        {
          status: 200, // Return a friendly JSON error message with 200 OK status to keep client processing smooth
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Ocorreu um erro ao gerar o seu avatar. Por favor, tente novamente com outra imagem.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
};

export const config: Config = {
  path: "/api/generate",
};
