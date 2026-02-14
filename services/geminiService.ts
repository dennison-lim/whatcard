import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Fix: Directly use process.env.API_KEY and named parameters as per the SDK guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function categorizeMerchant(merchantName: string): Promise<string> {
  // Fix: Assuming process.env.API_KEY is available and configured.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Categorize the merchant "${merchantName}" into exactly one of these categories: 
      ['Dining', 'Supermarkets', 'Travel', 'Flights', 'Hotels', 'Gas', 'Streaming', 'Online Grocery', 'Drugstore', 'Other']. 
      Return the result in JSON format with a single key "category".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const json = JSON.parse(text);
      return json.category || "Other";
    }
  } catch (error) {
    console.error("Gemini categorization failed:", error);
  }
  return "Other";
}