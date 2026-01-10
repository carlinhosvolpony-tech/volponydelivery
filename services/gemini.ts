
import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

// Função para obter a instância da IA de forma segura
const getAIInstance = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key não configurada. O assistente de IA não funcionará.");
  }
  return new GoogleGenAI({ apiKey });
};

const generateSystemInstruction = (restaurants: Restaurant[]) => `
Você é o "Volpony Bot", um assistente virtual inteligente do aplicativo de delivery "Volpony Delivery" em Arari.
Sua missão é ajudar usuários a escolherem o que comer ou pedir com base no cardápio disponível.

DADOS DO CARDÁPIO ATUAL:
${JSON.stringify(restaurants.map(r => ({
  restaurant: r.name,
  category: r.category,
  deliveryTime: r.deliveryTime,
  menu: r.menu.map(m => ({ item: m.name, desc: m.description, price: m.price }))
})))}

REGRAS:
1. Seja breve, amigável e use emojis verdes.
2. Sugira itens ESPECÍFICOS dos restaurantes listados acima.
3. O tom de voz deve ser prestativo e rápido.
`;

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  userMessage: string,
  currentRestaurants: Restaurant[]
): Promise<string> => {
  try {
    const ai = getAIInstance();
    if (!process.env.API_KEY) return "O assistente de IA está em manutenção (chave de API ausente). Por favor, explore o cardápio manualmente! 🍃";

    const model = 'gemini-3-flash-preview';
    
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

    return result.text || "Desculpe, não consegui processar sua mensagem agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ops! Tive um problema técnico ao processar seu pedido. Tente novamente em alguns segundos. 🍃";
  }
};
