import Dedalus from "dedalus-labs";
import { SandboxObject, Reframe } from "../types";

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

export const generateEmotionalImage = async (
  perspective: Perspective,
  emotionName: string | null
): Promise<string> => {
  if (!apiKey) {
    throw new Error("Missing VITE_DEDALUS_API_KEY");
  }

  const emotionContext = emotionName
    ? `infused with the feeling of ${emotionName}`
    : "neutral and calm";

  const prompt = `
    Create an abstract, artistic image in the style of a soft, watercolor mosaic or stained glass.
    Theme: "${perspective.title} - ${perspective.description}".
    Mood: ${emotionContext}.
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

export async function generateSummaryItem(objects: SandboxObject[], theme: string): Promise<{ name: string; imageUrl: string }> {
  const layoutDesc = objects.map(o => o.name).join(', ');
  
  // 1. Generate a poetic name for the summary object
  const nameCompletion = await client.chat.completions.create({
    model: "openai/gpt-5.2",
    messages: [
      {
        role: "user",
        content: `The user placed these items in a ${theme} themed sandplay: ${layoutDesc}. Invent a single poetic name for a "talisman" or "relic" that represents the spirit of this specific combination. Return ONLY the name.`,
      },
    ],
    temperature: 0.7,
  });

  const talismanName = (nameCompletion.choices[0]?.message?.content ?? "").trim() || "The Soul's Fragment";

  // 2. Generate the image for this talisman
  const imageUrl = await generateEmotionalImage(
    {
      title: talismanName,
      description: `${theme} sandplay talisman`,
    },
    null
  );

  return { name: talismanName, imageUrl };
}

export async function generateAssetImage(prompt: string): Promise<string | null> {
  try {
    const response = await client.images.generate({
      prompt: `A simple minimalist isometric sprite of ${prompt}. Clean white background, illustrative style, soft colors.`,
      model: "openai/dall-e-3",
      size: "1024x1024",
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) return null;

    // Convert to base64 for persistent storage
    const base64Image = await imageUrlToBase64(imageUrl);
    return base64Image;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
