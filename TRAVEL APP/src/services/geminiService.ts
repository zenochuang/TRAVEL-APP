import { GoogleGenAI } from "@google/genai";
import { WeatherData } from "../types";

// Support both Vite (Vercel) and local process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Now returns both weather data AND advice
export const getWeatherForecast = async (location: string, date: string): Promise<{ data: WeatherData, advice: string }> => {
  try {
    const prompt = `
      Location: ${location}
      Date: ${date}
      
      Please estimate the historical or expected weather for this location and date.
      Return the response in JSON format with the following keys:
      - tempMin (number, Celsius)
      - tempMax (number, Celsius)
      - rainProb (number, percentage 0-100)
      - condition (string, e.g. "Sunny", "Cloudy", in Traditional Chinese)
      - advice (string, short practical advice in Traditional Chinese, e.g. "Remember umbrella")
      
      Response Format:
      {
        "tempMin": 10,
        "tempMax": 20,
        "rainProb": 10,
        "condition": "多雲",
        "advice": "天氣涼爽，適合散步。"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonStr = response.text ? response.text.trim() : '{}';
    const result = JSON.parse(jsonStr);
    return {
      data: {
        tempMin: result.tempMin,
        tempMax: result.tempMax,
        rainProb: result.rainProb,
        condition: result.condition
      },
      advice: result.advice
    };
  } catch (error) {
    console.error("Gemini Weather Error:", error);
    // Fallback
    return {
      data: {
        tempMin: 15,
        tempMax: 22,
        rainProb: 20,
        condition: '晴時多雲'
      },
      advice: "無法取得天氣資訊，請攜帶雨具備用。"
    };
  }
};

export const categorizeExpenseItem = async (itemName: string): Promise<'Food' | 'Transport' | 'Accommodation' | 'Shopping' | 'Other'> => {
  try {
    const prompt = `
      Categorize the expense item "${itemName}" into exactly one of these categories: Food, Transport, Accommodation, Shopping, Other.
      Return ONLY the category word.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text ? response.text.trim() : '';
    if (['Food', 'Transport', 'Accommodation', 'Shopping', 'Other'].includes(text)) {
      return text as any;
    }
    return 'Other';
  } catch (error) {
    return 'Other';
  }
};