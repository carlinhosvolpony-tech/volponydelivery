
import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

const generateSystemInstruction = (restaurants: Restaurant[]) => `
Você é o "Volpony Bot", o assistente virtual do aplicativo "Volpony Delivery".
Sua missão é ajudar os usuários a encontrarem pratos, preços e lojas disponíveis.

ESTILO DE RESPOSTA:
1. Seja extremamente amigável e use emojis como 🍃, 🍔, 🍕.
2. Seja conciso. Não escreva textos longos.
3. Responda em Português do Brasil.

DADOS DAS LOJAS E PRODUTOS:
${JSON.stringify(restaurants.map(r => ({
  loja: r.name,
  categoria: r.category,
  tempo: r.deliveryTime,
  taxa: r.deliveryFee,
  cardapio: r.menu.map(m => ({ item: m.name, preco: m.price, desc: m.description }))
})))}

REGRAS:
- Sugira itens reais baseados nos dados acima.
- Se o usuário quiser pedir, diga que ele deve adicionar ao carrinho clicando no botão "+" no cardápio.
- Não invente lojas ou preços que não estão na lista.
`;

export const sendMessageToGemini = async (
  history: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  currentRestaurants: Restaurant[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: generateSystemInstruction(currentRestaurants),
        temperature: 0.7,
      }
    });

    return response.text || "Estou com um probleminha para processar sua mensagem. Que tal olhar nosso cardápio? 🍃";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "O Volpony Bot está offline no momento, mas as lojas continuam aceitando pedidos! 🍃";
  }
};
