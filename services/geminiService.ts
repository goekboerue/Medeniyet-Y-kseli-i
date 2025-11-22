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
  try {
    const buildingsList = gameState.buildings
      .filter(b => b.count > 0)
      .map(b => `${b.count} adet ${b.name}`)
      .join(', ');

    let stylePrompt = "";
    if (dominantStyle === BuildingStyle.MILITARY) {
      stylePrompt = "The atmosphere is militaristic, fortified, strict, and powerful. Banners, weapons, and defenses are visible.";
    } else if (dominantStyle === BuildingStyle.ECONOMIC) {
      stylePrompt = "The atmosphere is wealthy, bustling, golden, and prosperous. Markets, trade goods, and luxury are visible.";
    } else {
      stylePrompt = "The atmosphere is balanced and peaceful.";
    }

    const prompt = `
      A highly detailed, photorealistic wide-angle aerial shot of a civilization during the ${gameState.era} era.
      
      Climate/Biome: ${gameState.climate}. The environment should strictly reflect this climate.
      
      Visible buildings in the landscape: ${buildingsList}.
      
      Style & Atmosphere: ${stylePrompt}
      
      Lighting: Cinematic, golden hour or dramatic lighting suitable for the era.
      If Tribal: Campfires, nature, tents. 
      If Agricultural: Green fields (or snowy/sandy based on climate), stone structures, medieval feel.
      If Industrial: Smoke, brick factories, steel, steam, Victorian or early modern feel.
      If Technological: Neon lights, glass skyscrapers, futuristic drones, cyberpunk aesthetic.
      
      Make it look like a screenshot from a high-budget strategy game or a movie.
    `;

    // Use gemini-2.5-flash-image via generateContent for better availability
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Note: responseMimeType is not supported for this model
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    // Return null to let UI handle the fallback
    return null;
  }
};