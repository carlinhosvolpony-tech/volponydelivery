import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

// Lazy initialization to prevent crash on load if API key is missing
let ai: GoogleGenAI | null = null;

const getAiInstance = () => {
  if (!ai) {
    let apiKey = '';
    
    // Tenta obter a chave seguindo o padrão Vite (Vercel/Local)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY || '';
    }
    
    // Fallback para ambientes Node.js ou configurações antigas
    if (!apiKey && typeof process !== 'undefined' && process.env) {
        apiKey = process.env.VITE_API_KEY || process.env.API_KEY || '';
    }

    // Check if key exists and is not the placeholder text or empty
    if (!apiKey || apiKey === 'undefined' || apiKey === '' || apiKey.includes('Sua_API_Key')) {
      console.warn("Volpony: Gemini API Key is missing (VITE_API_KEY). AI features disabled.");
      return null;
    }
    try {
      ai = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize Gemini Client:", e);
      return null;
    }
  }
  return ai;
};

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
  history: { role: string; parts: { text: string }[] }[],
  userMessage: string,
  currentRestaurants: Restaurant[]
): Promise<string> => {
  try {
    const aiInstance = getAiInstance();
    
    if (!aiInstance) {
      return "Desculpe, o serviço de IA não está configurado corretamente no momento. (Chave de API ausente)";
    }

    const model = 'gemini-2.5-flash';
    
    const chat = aiInstance.chats.create({
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

    return result.text || "Desculpe, tive um problema ao processar seu pedido. Tente novamente!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ops! Tive um problema técnico. Tente novamente em alguns segundos. 🍃";
  }
};