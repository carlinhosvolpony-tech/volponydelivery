
import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

// Always initialize with named parameters and process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (restaurants: Restaurant[]) => `
Você é o "Volpony Bot", um assistente virtual inteligente e saudável do aplicativo de delivery "Volpony Delivery".
Sua missão é ajudar usuários a escolherem o que comer com base no cardápio disponível ATUALIZADO.

DADOS DO CARDÁPIO ATUAL:
${JSON.stringify(restaurants.map(r => ({
  restaurant: r.name,
  category: r.category,
  deliveryTime: r.deliveryTime,
  menu: r.menu.map(m => ({ item: m.name, desc: m.description, price: m.price }))
})))}

REGRAS:
1. Seja breve, amigável e use emojis (cor verde/natureza/comida).
2. Sugira itens ESPECÍFICOS dos restaurantes listados acima.
3. Se o usuário pedir algo que não existe, sugira a alternativa mais próxima.
4. Tente fazer "cross-selling" de forma leve.
5. O tom de voz deve ser "energético", "fresco" e "rápido".
`;

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userMessage: string,
  currentRestaurants: Restaurant[]
): Promise<string> => {
  try {
    // Basic Text Tasks: 'gemini-3-flash-preview'
    const model = 'gemini-3-flash-preview';
    
    // Initializing chat with history and system instruction
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: generateSystemInstruction(currentRestaurants),
        temperature: 0.7,
      },
      history: history 
    });

    const result = await chat.sendMessage({
      message: userMessage
    });

    // Accessing text as a property from the response object
    return result.text || "Desculpe, tive um problema ao processar seu pedido. Tente novamente!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ops! Tive um problema técnico. Tente novamente em alguns segundos. 🍃";
  }
};
