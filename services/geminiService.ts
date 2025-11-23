
import { GoogleGenAI } from "@google/genai";
import { GameState, Era, Crisis, BuildingStyle } from "../types";

// Initialize the Gemini API client
// We use a fallback empty string to prevent the app from crashing immediately 
// if the environment variable is not set in the deployment environment.
// Calls will fail gracefully later if the key is invalid.
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
      - Nüfus: ${totalPop} (Çalışan: ${usedWorkers}, Boşta: ${availableWorkers})
      - Altın: ${Math.floor(gameState.resources.gold)}
      - Toprak: ${gameState.resources.land} / ${gameState.resources.maxLand}
      - Binalar: ${gameState.buildings.filter(b => b.count > 0).map(b => `${b.name} (${b.count})`).join(', ')}
      
      Lütfen bu medeniyetin şu anki durumu hakkında 2-3 cümlelik kısa, epik ve atmosferik bir tarihçe girişi yaz. 
      Halkın yaşamını ve zorluklarını anlatırken mutlaka '${gameState.climate}' iklimin (soğuk, sıcak, yağmur, kuraklık vb.) etkisinden bahset.
      Eğer 'Boşta' çalışan sayısı çoksa işsizlikten, negatifse iş gücü yetersizliğinden bahsedebilirsin.
      Olayları biraz dramatize et. Türkçe yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Tarihçiler bu dönemi sessizlikle anıyor...";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Kadim parşömenler okunamıyor (Bağlantı hatası veya API Anahtarı eksik).";
  }
};

export const generateEraTransition = async (newEra: Era): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      Bir medeniyet strateji oyununda oyuncu yeni bir çağa geçti: ${newEra}.
      Bu geçişi kutlayan, insanlığın gelişimini vurgulayan 2 cümlelik ilham verici bir mesaj yaz. Türkçe yanıt ver.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || `${newEra} başladı!`;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return `${newEra} şafağı söktü.`;
  }
};

export const generateCrisisLog = async (crisis: Crisis, solved: boolean): Promise<string> => {
    try {
      const model = "gemini-2.5-flash";
      const prompt = `
        Bir medeniyet strateji oyununda bir kriz yaşandı: ${crisis.name} (${crisis.description}).
        Sonuç: ${solved ? "HALK BU KRİZİ ATLATTI" : "KRİZ MEDENİYETE ZARAR VERDİ"}.
        
        Bu durumu anlatan tek cümlelik dramatik bir tarihçe notu yaz. Türkçe yanıt ver.
      `;
  
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });
  
      return response.text || (solved ? `${crisis.name} çözüldü.` : `${crisis.name} büyük hasar verdi.`);
    } catch (error) {
      return solved ? "Zorlukların üstesinden gelindi." : "Karanlık günler yaşandı.";
    }
};

export const generateEmpireSnapshot = async (gameState: GameState, dominantStyle: BuildingStyle): Promise<string | null> => {
  if (!process.env.API_KEY) {
      console.error("Image generation skipped: No API Key.");
      return null;
  }

  try {
    const buildingsList = gameState.buildings
      .filter(b => b.count > 0)
      .map(b => `${b.count} ${b.name}`)
      .join(', ');

    let stylePrompt = "";
    if (dominantStyle === BuildingStyle.MILITARY) {
      stylePrompt = "Strong fortress walls, military banners, disciplined, dark and red tones.";
    } else if (dominantStyle === BuildingStyle.ECONOMIC) {
      stylePrompt = "Busy markets, golden rooftops, trade caravans, rich and amber tones.";
    } else {
      stylePrompt = "Peaceful village, balanced architecture, harmonious colors.";
    }

    // Simplified prompt to avoid safety filters and ensure better model understanding for "digital art"
    const prompt = `
      Digital concept art of a civilization city. 
      Era: ${gameState.era}. 
      Climate: ${gameState.climate}. 
      Buildings visible: ${buildingsList || "Small settlement"}.
      Atmosphere: ${stylePrompt}.
      High quality, detailed, isometric view or wide angle.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      // Note: gemini-2.5-flash-image does NOT support responseMimeType or responseSchema in config
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
    return null;
  }
};
