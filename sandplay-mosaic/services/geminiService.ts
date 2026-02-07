import Dedalus from "dedalus-labs";
import { SandboxObject, Reframe } from "../types";

const apiKey = import.meta.env.VITE_DEDALUS_API_KEY || "";
const client = new Dedalus({ apiKey });

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
  const imageResponse = await client.images.generate({
    prompt: `A high-quality minimalist isometric 3D render of a sacred talisman called "${talismanName}". It should look like a single precious object made of materials fitting a ${theme} theme. Soft cinematic lighting, white background, masterpiece style.`,
    model: "openai/dall-e-3",
    size: "1024x1024",
  });

  const imageUrl = imageResponse.data[0]?.url || "";
  return { name: talismanName, imageUrl };
}

export async function generateAssetImage(prompt: string): Promise<string | null> {
  try {
    const response = await client.images.generate({
      prompt: `A simple minimalist isometric sprite of ${prompt}. Clean white background, illustrative style, soft colors.`,
      model: "openai/dall-e-3",
      size: "1024x1024",
    });

    return response.data[0]?.url || null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
