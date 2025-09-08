import { GoogleGenAI, Type } from "@google/genai";
import type { TranslationResponse, EditingPlan, GeneratedContent } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

// Per coding guidelines, initialize with a named apiKey parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Per coding guidelines, use 'gemini-2.5-flash' for general text tasks.
const model = 'gemini-2.5-flash';

export const streamCVContent = async (prompt: string, onChunk: (chunk: string) => void) => {
  try {
    // Per coding guidelines, use generateContentStream for streaming.
    const response = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
    });

    for await (const chunk of response) {
      // Per coding guidelines, access the text directly from the chunk.
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error streaming content from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate content: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating content.");
  }
};

export const translateText = async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResponse> => {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
    Preserve the original meaning and tone.
    Also, identify any domain-specific or technical terms in the source text and provide a glossary for them in ${targetLang}.

    Text to translate:
    """
    ${text}
    """`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: {
                            type: Type.STRING,
                            description: `The translated text in ${targetLang}.`,
                        },
                        glossary: {
                            type: Type.ARRAY,
                            description: `A list of domain-specific terms and their definitions in ${targetLang}.`,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    term: {
                                        type: Type.STRING,
                                        description: 'The original term from the source text.',
                                    },
                                    definition: {
                                        type: Type.STRING,
                                        description: `The definition of the term in ${targetLang}.`,
                                    },
                                },
                                required: ['term', 'definition'],
                            },
                        },
                    },
                    required: ['translation', 'glossary'],
                },
            },
        });

        const jsonString = response.text.trim();
        // Fallback for cases where the API might not return valid JSON despite the schema
        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
             return { translation: jsonString, glossary: [] };
        }
        const parsedResponse: TranslationResponse = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to translate text: ${error.message}`);
        }
        throw new Error("An unknown error occurred during translation.");
    }
};

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const generateEditingPlan = async (imageFile: File, prompt: string): Promise<EditingPlan> => {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = {
        text: `Based on the provided image and the following desired edit, create a step-by-step plan for an automated image editing pipeline in Vietnamese.
        Do not perform the edit yourself.
        Return a list of transformations and an estimated total GPU computation time in seconds.
        The transformation names should be like function calls (e.g., 'remove_background', 'adjust_brightness').
        The parameters should be a string of key-value pairs.
        
        Desired Edit: "${prompt}"`
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        steps: {
                            type: Type.ARRAY,
                            description: "The list of editing transformations.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: "The name of the transformation function, e.g., 'remove_background', 'adjust_brightness'."
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: "A human-readable description of what this step does."
                                    },
                                    parameters: {
                                        type: Type.STRING,
                                        description: "Key-value parameters for the function, e.g., 'contrast: 1.2, brightness: 0.1'."
                                    }
                                },
                                required: ['name', 'description', 'parameters'],
                            },
                        },
                        estimated_compute: {
                            type: Type.OBJECT,
                            properties: {
                                gpu_seconds: {
                                    type: Type.NUMBER,
                                    description: "Estimated GPU seconds required for the entire pipeline."
                                }
                            },
                            required: ['gpu_seconds'],
                        }
                    },
                    required: ['steps', 'estimated_compute'],
                },
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
             throw new Error("API did not return valid JSON. Response: " + jsonString);
        }
        const parsedResponse: EditingPlan = JSON.parse(jsonString);
        return parsedResponse;
    } catch (error) {
        console.error("Error generating editing plan with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate editing plan: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the editing plan.");
    }
};

export const generateArticleContent = async (topic: string, audience: string, length: string, tone: string): Promise<GeneratedContent> => {
    const prompt = `Bạn là một chuyên gia tiếp thị nội dung người Việt. Dựa trên các thông tin sau, hãy tạo ra nội dung hoàn chỉnh bằng tiếng Việt.
Chủ đề: "${topic}"
Đối tượng mục tiêu: "${audience}"
Độ dài mong muốn: "${length}"
Văn phong: "${tone}"

Hãy cung cấp kết quả dưới dạng một đối tượng JSON có cấu trúc như sau:
1.  **title**: Một tiêu đề hấp dẫn, thu hút sự chú ý.
2.  **metaDescription**: Một mô tả meta ngắn gọn (khoảng 155-160 ký tự) để tối ưu SEO.
3.  **outline**: Một dàn ý chi tiết cho bài viết, dưới dạng một mảng các chuỗi.
4.  **article**: Toàn bộ nội dung bài viết, được định dạng tốt với các đoạn văn rõ ràng.
5.  **seoKeywords**: Một mảng các từ khóa SEO có liên quan.
6.  **hashtags**: Một mảng các hashtags phù hợp để sử dụng trên mạng xã hội.
`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Tiêu đề hấp dẫn của bài viết." },
                        metaDescription: { type: Type.STRING, description: "Mô tả meta ngắn gọn (155-160 ký tự) cho SEO." },
                        outline: {
                            type: Type.ARRAY,
                            description: "Dàn ý chi tiết cho bài viết.",
                            items: { type: Type.STRING }
                        },
                        article: { type: Type.STRING, description: "Nội dung bài viết đầy đủ, đã định dạng." },
                        seoKeywords: {
                            type: Type.ARRAY,
                            description: "Danh sách các từ khóa SEO liên quan.",
                            items: { type: Type.STRING }
                        },
                        hashtags: {
                            type: Type.ARRAY,
                            description: "Danh sách các hashtags phù hợp cho mạng xã hội.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['title', 'metaDescription', 'outline', 'article', 'seoKeywords', 'hashtags']
                },
            },
        });
        
        const jsonString = response.text.trim();
        if (!jsonString.startsWith('{') || !jsonString.endsWith('}')) {
             throw new Error("API did not return valid JSON. Response: " + jsonString);
        }
        const parsedResponse: GeneratedContent = JSON.parse(jsonString);
        return parsedResponse;

    } catch (error) {
        console.error("Error generating article content with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate article: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating the article.");
    }
};