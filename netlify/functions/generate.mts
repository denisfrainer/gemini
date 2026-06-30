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
      const watermarkPath = path.join(process.cwd(), 'public/assets/watermark.png');
      
      // Get image width to scale the logo
      const imageMetadata = await sharp(imageBuffer).metadata();
      const imageWidth = imageMetadata.width || 1024;
      const logoWidth = Math.round(imageWidth * 0.4); // 40% of image width
      
      console.log(`[WATERMARK_APPLIED] Watermark scaled to 40% of image width (width: ${logoWidth}px).`);

      // Resize the watermark first
      const logo = await sharp(watermarkPath)
        .resize({ width: logoWidth })
        .toBuffer();

      // Apply the composite in the center
      const watermarkedBuffer = await sharp(imageBuffer)
        .composite([{ 
          input: logo, 
          gravity: 'center', 
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
