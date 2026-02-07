
import { GoogleGenAI, Type } from "@google/genai";
import { SandboxObject, Reframe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              color: { type: Type.STRING }
            },
            required: ['type', 'title', 'content', 'color']
          }
        }
      }
    });

    return JSON.parse(response.text);
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
  const nameResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user placed these items in a ${theme} themed sandplay: ${layoutDesc}. Invent a single poetic name for a "talisman" or "relic" that represents the spirit of this specific combination. Return ONLY the name.`,
  });
  
  const talismanName = nameResponse.text?.trim() || "The Soul's Fragment";

  // 2. Generate the image for this talisman
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-quality minimalist isometric 3D render of a sacred talisman called "${talismanName}". It should look like a single precious object made of materials fitting a ${theme} theme. Soft cinematic lighting, white background, masterpiece style.` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  let imageUrl = "";
  for (const part of imageResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }

  return { name: talismanName, imageUrl };
}

export async function generateAssetImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A simple minimalist isometric sprite of ${prompt}. Clean white background, illustrative style, soft colors.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}
