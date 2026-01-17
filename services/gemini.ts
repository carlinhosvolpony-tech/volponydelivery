
import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

const generateSystemInstruction = (restaurants: Restaurant[]) => `
Você é o "Volpony Bot", o assistente virtual inteligente do aplicativo "Volpony Delivery".
Sua missão é ajudar os usuários a encontrarem pratos, preços e lojas.

DADOS DO CARDÁPIO ATUAL:
${JSON.stringify(restaurants.map(r => ({
  restaurant: r.name,
  category: r.category,
  deliveryTime: r.deliveryTime,
  menu: r.menu.map(m => ({ item: m.name, desc: m.description, price: m.price }))
})))}

REGRAS:
1. Seja amigável, rápido e use emojis verdes.
2. Sugira itens REAIS das lojas listadas.
3. Se o usuário perguntar sobre taxas ou prazos, cite os dados acima.
`;

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userMessage: string,
  currentRestaurants: Restaurant[]
): Promise<string> => {
  try {
    // Fixed: Always use a named parameter for the API key from environment variables
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (!process.env.API_KEY) {
      return "O assistente IA do Volpony Delivery está descansando um pouco. Explore o cardápio manualmente! 🍃";
    }

    // Fixed: Using systemInstruction within config and correct generateContent pattern
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: h.parts })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: generateSystemInstruction(currentRestaurants),
        temperature: 0.7,
      }
    });

    // Fixed: Accessing response text using the .text property directly
    return response.text || "Desculpe, tive um soluço técnico. Como posso ajudar?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ops! O Volpony Bot teve um problema técnico. Tente novamente em instantes. 🍃";
  }
};
