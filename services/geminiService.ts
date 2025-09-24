import { GoogleGenAI, Type } from "@google/genai";
import type { User, Prospect } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const findProspects = async (service: string, businessType: string, location: string): Promise<Prospect[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Actúa como un experto en generación de leads B2B. Basado en los siguientes criterios: Servicio ofrecido '${service}', Tipo de comercio '${businessType}', Ubicación '${location}', busca en LinkedIn al menos 20 empresas que coincidan. Para cada empresa, proporciona el nombre de la empresa, su URL de LinkedIn, el nombre de un contacto relevante (Gerente, Director o similar), un correo electrónico de contacto para esa persona (debe ser un correo válido y no genérico como 'info@' o 'contacto@'), y una 'probabilidadDeContratacion' (un porcentaje de 0 a 100 que represente la probabilidad de que contraten para el servicio de '${service}'). La respuesta debe ser únicamente un array JSON válido.`,
      // FIX: `responseMimeType` and `responseSchema` are not allowed when using the `googleSearch` tool.
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let jsonStr = response.text.trim();
    // Gemini sometimes wraps JSON in markdown backticks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
    const prospects = JSON.parse(jsonStr) as Prospect[];
    // Filter out invalid emails
    const validProspects = prospects.filter(p => p.contactEmail && !p.contactEmail.startsWith('info@'));
    // Sort by hiring probability
    return validProspects.sort((a, b) => b.hiringProbability - a.hiringProbability);

  } catch (error) {
    console.error("Error finding prospects:", error);
    throw new Error("No se pudieron encontrar prospectos. Por favor, intente con otros criterios.");
  }
};

export const generateEmail = async (user: User, prospect: Prospect, service: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Eres un experto redactor de ventas. Escribe un correo electrónico profesional y persuasivo para ${prospect.contactPerson} en ${prospect.companyName}. El objetivo es presentar mi servicio de ${service}. El correo debe ser conciso, personalizado y profesional. El tono debe ser útil, no agresivo. El correo será firmado con: "${user.name}", "${user.email}", "${user.website}". No incluyas una línea de asunto, solo el cuerpo del correo. Empieza el correo con "Hola ${prospect.contactPerson},"`,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating email:", error);
    throw new Error("No se pudo generar el correo electrónico.");
  }
};