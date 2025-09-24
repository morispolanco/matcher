
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Prospect } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
};

const parseJsonResponse = <T,>(jsonString: string, context: string): T | null => {
  try {
    const cleanedString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
    return JSON.parse(cleanedString) as T;
  } catch (error) {
    console.error(`Error parsing JSON for ${context}:`, error, "Original string:", jsonString);
    return null;
  }
};

export const generateProspects = async (service: string, industry: string, location: string): Promise<Prospect[]> => {
  const ai = getAiClient();
  const prompt = `
    Based on the following criteria, generate a list of 20 fictional companies in JSON format that are potential prospects.
    Criteria:
    - Service Needed: ${service}
    - Industry/Type of Commerce: ${industry}
    - Location: ${location}

    For each company, provide:
    - companyName: string
    - industry: string
    - location: string
    - website: a plausible-looking fake URL (e.g., 'www.companyname.com')
    - contact: { name: string, title: string (e.g., 'Marketing Manager', 'Director of Operations'), email: string (a direct, non-generic email like 'firstname.lastname@company.com', NOT starting with 'info@', 'contact@', 'hello@', etc.) }

    Your entire response must be a single JSON array. Do not include any text before or after the JSON array.
  `;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            industry: { type: Type.STRING },
            location: { type: Type.STRING },
            website: { type: Type.STRING },
            contact: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
  });

  const prospectsData = parseJsonResponse<Omit<Prospect, 'id'>[]>(response.text, 'prospects');
  
  if (!prospectsData) {
      throw new Error("Failed to parse prospects from API response.");
  }

  return prospectsData.map((p, index) => ({ ...p, id: `${Date.now()}-${index}` }));
};


export const analyzeProspect = async (prospect: Prospect, userServices: string[]): Promise<{ hiringProbability: number; analysis: string } | null> => {
    const ai = getAiClient();
    const prompt = `
        Analyze the following business prospect for a potential partnership.

        My Profile:
        - Services I offer: ${userServices.join(', ')}

        Prospect Profile:
        - Company Name: ${prospect.companyName}
        - Industry: ${prospect.industry}
        - Location: ${prospect.location}

        Based on this information, provide a JSON object with the following structure:
        - hiringProbability: A number between 60 and 95 representing the percentage probability that this company would hire for my services.
        - analysis: A concise, one-paragraph analysis in Spanish explaining why this company is a strong potential client and how my services align with their likely needs. Mention specific services from my list.

        Your entire response must be a single JSON object. Do not include any text before or after the JSON object.
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    hiringProbability: { type: Type.NUMBER },
                    analysis: { type: Type.STRING }
                }
            }
        }
    });

    return parseJsonResponse<{ hiringProbability: number; analysis: string }>(response.text, 'prospect analysis');
};


export const generateEmail = async (userProfile: UserProfile, prospect: Prospect, userServices: string[]): Promise<{ subject: string; body: string } | null> => {
    const ai = getAiClient();
    const prompt = `
        You are an expert sales and outreach assistant. Write a personalized, professional, and compelling cold email in Spanish based on the following information.

        My Information (Sender):
        - Name: ${userProfile.name}
        - Email: ${userProfile.email}
        - Website: ${userProfile.website}
        - Services Offered: ${userServices.join(', ')}

        Prospect Information (Recipient):
        - Contact Name: ${prospect.contact.name}
        - Contact Title: ${prospect.contact.title}
        - Company Name: ${prospect.companyName}

        Analysis of Prospect's Needs:
        - ${prospect.analysis?.analysis}

        Instructions:
        1. The email should be addressed directly to ${prospect.contact.name}.
        2. The subject line should be engaging and relevant, for example: "Idea para ${prospect.companyName}" or "Colaboración potencial para ${prospect.companyName}".
        3. The body of the email must be concise (3-4 short paragraphs).
        4. Reference the prospect's company or industry to show you've done your research.
        5. Briefly introduce yourself and your services.
        6. Explain how your services can directly benefit ${prospect.companyName}, using insights from the provided analysis.
        7. End with a clear call to action, like suggesting a brief 15-minute call.
        8. The signature must be exactly:
        ${userProfile.name}
        ${userProfile.email}
        ${userProfile.website}

        Provide the response as a JSON object with two keys: "subject" and "body". The body must include line breaks as '\\n'.

        Your entire response must be a single JSON object. Do not include any text before or after it.
    `;

    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING }
                }
            }
        }
    });

    return parseJsonResponse<{ subject: string; body: string }>(response.text, 'email generation');
};
