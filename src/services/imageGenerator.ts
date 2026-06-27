import Replicate from "replicate";

export interface ImageGenerationResult {
  type: string;
  title: string;
  imageUrl: string;
  caption: string;
  provider: string;
}

let replicateClient: Replicate | null = null;

function getReplicateClient(): Replicate | null {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token || token.trim() === "" || token.includes("YOUR_REPLICATE_API")) {
    return null;
  }
  if (!replicateClient) {
    replicateClient = new Replicate({
      auth: token.trim(),
    });
  }
  return replicateClient;
}

/**
 * Modular Image Generation Service
 * Supports Replicate (using flux-schnell or sdxl) with automatic graceful fallback.
 */
export async function generateImageWithProvider(
  prompt: string,
  title: string,
  providerOverride?: "replicate" | "placeholder"
): Promise<ImageGenerationResult> {
  const startTime = Date.now();
  const activeProvider = providerOverride || (process.env.REPLICATE_API_TOKEN ? "replicate" : "placeholder");

  console.log(`\n================== [IMAGE GENERATION START] ==================`);
  console.log(`[QA log] Requested Topic: "${title}"`);
  console.log(`[QA log] Selected Provider Candidate: "${activeProvider}"`);
  console.log(`[QA log] Original Prompt: "${prompt}"`);

  if (activeProvider === "replicate") {
    const replicate = getReplicateClient();
    if (!replicate) {
      const elapsed = Date.now() - startTime;
      console.warn(`[QA log] Replicate token missing or invalid. Fallback Triggered!`);
      console.warn(`[QA log] Generation Time: ${elapsed}ms`);
      console.warn(`[QA log] Success: false`);
      console.log(`================== [IMAGE GENERATION END] ==================\n`);
      return getPlaceholderResult(prompt, title);
    }

    try {
      console.log(`[QA log] Dispatching prompt to Replicate API...`);
      
      const replicatePromise = (async () => {
        try {
          const output = await replicate.run(
            "black-forest-labs/flux-schnell",
            {
              input: {
                prompt: prompt,
                aspect_ratio: "1:1",
                num_outputs: 1,
                output_format: "webp",
                output_quality: 80,
              }
            }
          );
          return { output, modelUsed: "black-forest-labs/flux-schnell" };
        } catch (fluxError: any) {
          console.warn(`[QA log] flux-schnell failed, trying stability-ai/sdxl fallback:`, fluxError.message || fluxError);
          const sdxlOutput = await replicate.run(
            "stability-ai/sdxl:7762d3c178520bfd21f69004eae3705d6a4d29f21855e4e043540ae850fbf959",
            {
              input: {
                prompt: prompt,
                negative_prompt: "low quality, blurry, distorted, low resolution, bad hands, text",
                num_inference_steps: 25,
                guidance_scale: 7.5,
              }
            }
          );
          return { output: sdxlOutput, modelUsed: "stability-ai/sdxl" };
        }
      })();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Replicate image generation timed out (25s Limit)")), 25000)
      );

      const result = await Promise.race([replicatePromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;

      let imageUrl = "";
      const output = result.output;
      if (Array.isArray(output)) {
        imageUrl = output[0];
      } else if (typeof output === "string") {
        imageUrl = output;
      } else if (output && typeof output === "object") {
        imageUrl = (output as any).url || (output as any)[0] || String(output);
      }

      if (!imageUrl || !imageUrl.startsWith("http")) {
        throw new Error("Could not extract a valid image URL from Replicate response");
      }

      console.log(`[QA log] Generation Time: ${elapsed}ms`);
      console.log(`[QA log] Success: true`);
      console.log(`[QA log] Model Used: ${result.modelUsed}`);
      console.log(`[QA log] Fallback Triggered: false`);
      console.log(`[QA log] Extracted Image URL: ${imageUrl}`);
      console.log(`================== [IMAGE GENERATION END] ==================\n`);

      return {
        type: "IMAGE",
        title: title || "Generated Conceptual Diagram",
        imageUrl,
        caption: `An AI-generated academic visualization illustrating the core structural principles of "${title}". Built via Replicate (${result.modelUsed}).`,
        provider: "replicate",
      };

    } catch (err: any) {
      const elapsed = Date.now() - startTime;
      console.error(`[QA log] Replicate service failed:`, err.message || err);
      console.warn(`[QA log] Fallback Triggered!`);
      console.warn(`[QA log] Generation Time: ${elapsed}ms`);
      console.warn(`[QA log] Success: false`);
      console.log(`================== [IMAGE GENERATION END] ==================\n`);
      return getPlaceholderResult(prompt, title);
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(`[QA log] Generation Time: ${elapsed}ms`);
  console.log(`[QA log] Success: true (via Placeholder)`);
  console.log(`[QA log] Fallback Triggered: false (Explicit fallback requested or token missing)`);
  console.log(`================== [IMAGE GENERATION END] ==================\n`);
  return getPlaceholderResult(prompt, title);
}

/**
 * Robust fallback image generator using high-quality Unsplash academic/educational photography
 */
function getPlaceholderResult(prompt: string, title: string): ImageGenerationResult {
  const encTitle = encodeURIComponent(title || "science diagram");
  const fallbackImages = [
    `https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800`,
    `https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800`,
    `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800`,
    `https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800`
  ];
  
  // Deterministic select based on title length
  const selectIdx = (title?.length || 0) % fallbackImages.length;
  const imageUrl = fallbackImages[selectIdx];

  return {
    type: "IMAGE",
    title: title || "Academic Schematic Illustration",
    imageUrl,
    caption: `An illustrative educational graphic rendering key concepts of "${title}". (Fallback placeholder mode active)`,
    provider: "placeholder",
  };
}
