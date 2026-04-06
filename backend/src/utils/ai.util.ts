import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';

const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

export const validateAnswerWithAI = async (doubtTitle: string, doubtDesc: string, answerSteps: string[]) => {
  try {
    const prompt = `
      Evaluate the following answer to a student's doubt.
      Doubt: ${doubtTitle}
      Description: ${doubtDesc}

      Answer Steps:
      Step 1: ${answerSteps[0]}
      Step 2: ${answerSteps[1]}
      Step 3: ${answerSteps[2]}

      Rate the answer's accuracy from 0 to 100. Provide ONLY a JSON response in the following format:
      {"score": 85, "confidence": 90, "reasoning": "brief explanation"}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('AI Error:', error);
    return { score: 50, confidence: 0, reasoning: 'AI validation failed, default score assigned.' };
  }
};
