
import { GoogleGenAI, Type } from "@google/genai";

export interface ValidationResult {
  relevance_score: number;
  correctness_score: number;
  feedback: string;
}

class AIAnswerValidationService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  }

  async validateAnswer(question: string, answer: string): Promise<ValidationResult> {
    const prompt = `You are an academic evaluator. Analyze the question and the student's answer.

Evaluate:
* How relevant the answer is to the question.
* Whether the answer is logically correct.

Return ONLY in JSON format:
{
  "relevance_score": number (0-100),
  "correctness_score": number (0-100),
  "feedback": "short explanation"
}

Question: ${question}
Student Answer: ${answer}`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              relevance_score: { type: Type.NUMBER },
              correctness_score: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
            },
            required: ["relevance_score", "correctness_score", "feedback"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");
      
      return JSON.parse(text) as ValidationResult;
    } catch (error) {
      console.error("AI Validation Error:", error);
      throw new Error("Failed to validate answer with AI. Please try again.");
    }
  }
}

export const aiAnswerValidation = new AIAnswerValidationService();
