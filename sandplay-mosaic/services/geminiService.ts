import Dedalus from "dedalus-labs";
import { SandboxObject, Reframe, AssetTheme } from "../types";

const apiKey = import.meta.env.VITE_DEDALUS_API_KEY || "";
const client = new Dedalus({ apiKey });

interface Perspective {
  title: string;
  description: string;
}

// Convert image URL to base64 data URL for persistent storage
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to convert image to base64, using original URL", error);
    return imageUrl;
  }
}

// Remove chroma key (green) background and return PNG data URL
async function removeChromaKeyBackground(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Broad green removal: remove any strong green-dominant pixels
        const greenDominance = g - Math.max(r, b);
        const isGreenish = g > 50 && greenDominance > 10;

        if (isGreenish) {
          // Soft feather based on dominance; stronger green => more transparency
          const feather = Math.min(1, Math.max(0, (greenDominance - 10) / 120));
          data[i + 3] = Math.round(data[i + 3] * (1 - feather));

          // If extremely green, fully remove
          if (greenDominance > 90 || g > 200) {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => reject(err);
    img.src = imageUrl;
  });
}

export const generateEmotionalImage = async (
  perspective: Perspective,
  emotionName: string | null,
  emotionColor: string | null
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Missing VITE_DEDALUS_API_KEY");
  }

  const emotionContext = emotionName
    ? `infused with the feeling of ${emotionName}`
    : "neutral and calm";

  const colorContext = emotionColor
    ? `Use the style/theme color ${emotionColor} as a dominant accent within the palette.`
    : "Use a gentle, harmonious accent color within the palette.";

  const prompt = `
    Create an abstract, artistic image in the style of a soft, watercolor mosaic or stained glass.
    Theme: "${perspective.title} - ${perspective.description}".
    Mood: ${emotionContext}.
    ${colorContext}
    Colors: Soft, warm, healing, pastel tones.
    Visuals: Abstract shapes fitting together, glowing light, ethereal. No text.
  `;

  const response = await client.images.generate({
    prompt,
    model: "openai/dall-e-3",
    size: "1024x1024",
  });

  const imageUrl = response.data[0]?.url;
  if (!imageUrl) {
    throw new Error("No image URL returned");
  }

  // Convert to base64 for persistent storage
  const base64Image = await imageUrlToBase64(imageUrl);
  return base64Image;
};

export async function generateReframes(objects: SandboxObject[], theme: string): Promise<Reframe[]> {
  const layoutDesc = objects.map(o => `${o.name} at (${o.x}, ${o.y})`).join(', ');
  const prompt = `
    The user is performing digital sandplay therapy. 
    Theme: ${theme}. 
    Objects placed: ${layoutDesc}.
    
    Provide three distinct interpretations (Reframes) of this scene:
    1. THE MIRROR (Empathetic): Validate current feelings.
    2. THE ARCHITECT (Analytical): Analyze boundaries, space, and structure.
    3. THE POET (Abstract): Offer a metaphorical or spiritual interpretation.
    
    Keep responses brief, soothing, and insightful.
    Return JSON ONLY as an array of 3 objects with keys: type, title, content, color.
  `;

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-5.2",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return JSON.parse(content);
  } catch (error) {
    console.error("Analysis Error:", error);
    return [
      { type: 'Mirror', title: 'Self-Reflection', content: 'You have created a space that speaks of quiet strength.', color: 'blue' },
      { type: 'Architect', title: 'Spatial Harmony', content: 'The distribution of items suggests a search for balance.', color: 'emerald' },
      { type: 'Poet', title: 'Whispering Winds', content: 'Each object is a word in a silent poem of the soul.', color: 'purple' }
    ];
  }
}

export async function generateSummaryItem(objects: SandboxObject[], theme: string): Promise<{ name: string; imageUrl: string; accent: string; mood: string }> {
  const layoutDesc = objects.map(o => o.name).join(', ');
  
  // 1. Generate poetic name, emotion analysis, and color
  try {
    const analysisCompletion = await client.chat.completions.create({
      model: "openai/gpt-5.2",
      messages: [
        {
          role: "user",
          content: `
            The user placed these items in a ${theme} themed sandplay: ${layoutDesc}.
            
            Tasks:
            1. Invent a single poetic name for a "talisman" or "relic" that represents the spirit of this specific combination.
            2. Analyze the potential emotion/mood of the user based on the layout and objects.
            3. Select a pure hex color code that best represents this emotion based on an expanded emotion color wheel. Be creative and nuanced with the palette.
            Examples:
            - Joy: Yellow, Gold, Amber
            - Sadness: Blue, Indigo, Slate
            - Anger: Red, Crimson, Maroon
            - Trust/Healing: Green, Emerald, Mint
            - Fear/Anxiety: Purple, Violet, Black
            - Love/Compassion: Pink, Rose, Magenta
            - Surprise/Wonder: Cyan, Sky Blue, Electric Blue
            - Anticipation/Energy: Orange, Coral, Tangerine
            - Serenity/Peace: Teal, Turquoise, Aqua
            - Mystery/Magic: Deep Purple, Midnight Blue
            - Grounding/Stability: Brown, Earth, Ochre
            - Confusion/Ambiguity: Grey, Lavender, Beige
            
            IMPORTANT: Do NOT simply pick the color of the theme (e.g. do not just pick green for Forest or blue for Sea). Look deeper at the OBJECTS and their emotional meaning. If a user places a "skull" in a "Forest", the emotion might be Fear (Purple/Black), not Green. If they place a "sun" in "Deep Sea", it might be Hope (Yellow), not Blue.
            
            Return valid JSON ONLY with these keys:
            {
              "name": "string",
              "emotion": "string",
              "color": "#hexcode"
            }
          `,
        },
      ],
      temperature: 0.7,
    });

    const content = analysisCompletion.choices[0]?.message?.content || "{}";
    // Attempt to parse JSON, finding the first { and last }
    const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    const result = JSON.parse(jsonStr || '{"name": "The Soul Fragment", "emotion": "Calm", "color": "#64748b"}');
    
    const talismanName = result.name || "The Soul Fragment";
    const emotion = result.emotion || "Calm";
    const color = result.color || "#64748b";

    // 2. Generate the image for this talisman
    const imageUrl = await generateEmotionalImage(
      {
        title: talismanName,
        description: `${theme} sandplay talisman`,
      },
      emotion,
      color
    );

    return { name: talismanName, imageUrl, accent: color, mood: emotion };

  } catch (err) {
    console.error("Summary Generation Failed:", err);
    // Fallback
    const fallbackName = "The Silent Echo";
    const imageUrl = await generateEmotionalImage({ title: fallbackName, description: "Unknown talisman" }, null, null);
    return { name: fallbackName, imageUrl, accent: "#94a3b8", mood: "Reflection" };
  }
}

export async function generateAssetImage(prompt: string, theme: AssetTheme): Promise<string | null> {
  try {
    const response = await client.images.generate({
      prompt: `IMPORTANT: Background MUST be pure chroma green sRGB (R=0,G=255,B=0) / #00FF00. Flat, uniform, no gradients, shadows, vignettes, or noise.

    Create one abstract sandbox asset of ${prompt} for the "${theme}" theme in strict 2.5D isometric (30°/30°). No environment/ground/scene. Modular asset; calm minimalist; slight abstraction but architectural; firm geometry with softened edges; simplified planes/volumes; matte with subtle texture; muted Morandi palette (2-3 colors), low contrast, neutral-to-warm.`,
      model: "openai/dall-e-3",
      size: "1024x1024",
    });

    const firstImage = response.data[0];
    const imageUrl = firstImage?.url
      ? firstImage.url
      : firstImage?.b64_json
        ? `data:image/png;base64,${firstImage.b64_json}`
        : null;

    if (!imageUrl) {
      console.warn("Image Gen Error: No image returned", response);
      return null;
    }

    try {
      const transparentPng = await removeChromaKeyBackground(imageUrl);
      return transparentPng;
    } catch (bgError) {
      console.warn("Chroma key removal failed, falling back to original image", bgError);
      const fallback = await imageUrlToBase64(imageUrl);
      return fallback;
    }
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
