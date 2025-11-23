
import { GoogleGenAI } from "@google/genai";
import { GameState, Era, Crisis, BuildingStyle } from "../types";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateChronicle = async (gameState: GameState): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    
    const totalPop = Math.floor(gameState.resources.population);
    const usedWorkers = gameState.buildings.reduce((total, b) => total + (b.baseCost.workers * b.count), 0);
    const availableWorkers = totalPop - usedWorkers;

    const prompt = `
      Bir medeniyet inşa etme oyununda anlatıcısın.
      Şu anki oyun durumu:
      - Çağ: ${gameState.era}
      - İklim: ${gameState.climate}
      - Nüfus: ${totalPop}
      - Altın: ${Math.floor(gameState.resources.gold)}
      - Toprak: ${gameState.resources.land} / ${gameState.resources.maxLand}
      
      Lütfen bu medeniyetin şu anki durumu hakkında 2 cümlelik kısa, epik bir tarihçe girişi yaz. 
      Halkın durumundan ve krallığın zenginliğinden/fakirliğinden bahset.
      Türkçe yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Tarihçiler bu dönemi sessizlikle anıyor...";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Kadim parşömenler okunamıyor (Bağlantı hatası).";
  }
};

export const generateEraTransition = async (newEra: Era): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Bir medeniyet strateji oyununda oyuncu yeni bir çağa geçti: ${newEra}.
      Bu geçişi kutlayan tek cümlelik epik bir mesaj yaz. Türkçe yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || `${newEra} başladı!`;
  } catch (error) {
    return `${newEra} şafağı söktü.`;
  }
};

export const generateCrisisLog = async (crisis: Crisis, solved: boolean): Promise<string> => {
    try {
      const model = "gemini-2.5-flash";
      const prompt = `
        Kriz: ${crisis.name}. Durum: ${solved ? "ÇÖZÜLDÜ" : "BAŞARISIZ"}.
        Bunu anlatan çok kısa, dramatik bir cümle yaz. Türkçe.
      `;
  
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
  
      return response.text || (solved ? `${crisis.name} çözüldü.` : `${crisis.name} zarar verdi.`);
    } catch (error) {
      return solved ? "Zorluklar aşıldı." : "Karanlık günler.";
    }
};

export const generateEmpireSnapshot = async (gameState: GameState, dominantStyle: BuildingStyle): Promise<string | null> => {
  if (!process.env.API_KEY) {
      console.error("Image generation skipped: No API Key.");
      return null;
  }

  try {
    // Simplified prompt to ensure higher success rate and avoid safety filters
    let aesthetic = "isometric strategy game asset, low poly, vibrant colors";
    if (dominantStyle === BuildingStyle.MILITARY) aesthetic = "dark fantasy fortress, isometric, red banners, imposing";
    if (dominantStyle === BuildingStyle.ECONOMIC) aesthetic = "golden city, bustling market, isometric, luxurious";
    
    // We remove specific building counts to avoid confusing the model with math, focusing on vibe
    const prompt = `
      Digital art, ${aesthetic}. 
      A civilization city in the ${gameState.era} era. 
      Climate environment: ${gameState.climate}.
      High quality, 3d render, unreal engine style, centered composition, no text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {}
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    console.warn("No image data found in response parts.");
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    // Return null to let the UI handle the error state
    return null;
  }
};
