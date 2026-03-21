import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const client = ANTHROPIC_KEY ? new Anthropic() : null;

// In-memory translation cache to avoid re-translating the same text
const translationCache = new Map<string, { text: string; timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): string | null {
  const entry = translationCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.text;
  return null;
}

function setCache(key: string, text: string) {
  translationCache.set(key, { text, timestamp: Date.now() });
  // Evict old entries if cache grows too large
  if (translationCache.size > 2000) {
    const oldest = [...translationCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) translationCache.delete(oldest[0]);
  }
}

/**
 * Translates a product description from English to natural Venezuelan Spanish.
 * Preserves brand names, model numbers, technical specs, and formatting.
 */
export async function translateDescription(englishText: string): Promise<string> {
  if (!client || !englishText || englishText.trim().length < 5) return englishText;

  const cached = getCached(`desc:${englishText}`);
  if (cached) return cached;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Traduce esta descripción de producto de Amazon al español natural para consumidores venezolanos.

Reglas:
- Español natural y fluido, NO traducción literal/robótica
- NO traduzcas marcas, nombres de modelos, números de modelo, siglas técnicas (USB-C, Bluetooth, WiFi, HD, etc.)
- Preserva números, medidas y especificaciones técnicas exactas
- Preserva el formato: si hay viñetas o saltos de línea, mantenlos
- NO agregues información extra ni comentarios
- Responde SOLO con la traducción, nada más

Texto:
${englishText}`
      }],
    });

    const translated = (response.content[0] as any).text?.trim() || englishText;
    setCache(`desc:${englishText}`, translated);
    return translated;
  } catch (e: any) {
    console.error("[TRANSLATE] Description translation error:", e.message);
    return englishText; // Fallback to English on error
  }
}

/**
 * Translates an array of feature bullets from English to Spanish.
 * Processes all bullets in a single API call for efficiency.
 */
export async function translateBullets(bullets: string[]): Promise<string[]> {
  if (!client || !bullets || bullets.length === 0) return bullets;

  const cacheKey = `bullets:${bullets.join("|||")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached.split("|||");

  try {
    const numbered = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{
        role: "user",
        content: `Traduce estas características de producto de Amazon al español natural para consumidores venezolanos.

Reglas:
- Español natural y fluido, NO traducción literal
- NO traduzcas marcas, nombres de modelos, siglas técnicas (USB-C, Bluetooth, WiFi, HD, LED, etc.)
- Preserva números, medidas y especificaciones exactas
- Responde SOLO con las líneas traducidas, numeradas igual (1. 2. 3. etc.), sin comentarios extra

Características:
${numbered}`
      }],
    });

    const text = (response.content[0] as any).text?.trim() || "";
    const translated = text
      .split("\n")
      .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((line: string) => line.length > 0);

    // Ensure we got the right number of translations
    if (translated.length === bullets.length) {
      setCache(cacheKey, translated.join("|||"));
      return translated;
    }
    // Fallback: return originals if count mismatch
    return bullets;
  } catch (e: any) {
    console.error("[TRANSLATE] Bullets translation error:", e.message);
    return bullets; // Fallback to English on error
  }
}
