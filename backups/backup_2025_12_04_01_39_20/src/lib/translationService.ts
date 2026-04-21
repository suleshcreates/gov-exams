import logger from './logger';

interface TranslationCache {
    [key: string]: string;
}

// In-memory cache to avoid re-translating same text
const cache: TranslationCache = {};

/**
 * Translate text from English to Marathi
 * Uses MyMemory Translation API (free tier - 1000 words/day)
 * 
 * @param text - English text to translate
 * @returns Translated Marathi text
 */
export async function translateToMarathi(text: string): Promise<string> {
    if (!text || text.trim() === '') {
        return text;
    }

    // Check cache first
    const cacheKey = `en-mr:${text}`;
    if (cache[cacheKey]) {
        logger.debug('Translation cache hit:', text.substring(0, 50));
        return cache[cacheKey];
    }

    try {
        const API_URL = 'https://api.mymemory.translated.net/get';
        const params = new URLSearchParams({
            q: text,
            langpair: 'en|mr',
        });

        const response = await fetch(`${API_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`Translation API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.responseStatus !== 200) {
            throw new Error('Translation failed: ' + data.responseDetails);
        }

        const translatedText = data.responseData.translatedText;

        // Cache the result
        cache[cacheKey] = translatedText;

        logger.debug('Translation successful:', text.substring(0, 30), '->', translatedText.substring(0, 30));

        return translatedText;
    } catch (error) {
        logger.error('Translation error:', error);
        // Return original text if translation fails
        return text;
    }
}

/**
 * Batch translate multiple texts
 * Useful for translating question + all options at once
 * 
 * @param texts - Array of English texts to translate
 * @returns Array of translated Marathi texts
 */
export async function batchTranslate(texts: string[]): Promise<string[]> {
    try {
        // Translate all texts in parallel
        const translations = await Promise.all(
            texts.map(text => translateToMarathi(text))
        );
        return translations;
    } catch (error) {
        logger.error('Batch translation error:', error);
        // Return original texts if batch translation fails
        return texts;
    }
}

/**
 * Clear translation cache
 * Useful for testing or if cache gets too large
 */
export function clearTranslationCache(): void {
    Object.keys(cache).forEach(key => delete cache[key]);
    logger.debug('Translation cache cleared');
}

/**
 * Get cache statistics
 * @returns Number of cached translations
 */
export function getCacheSize(): number {
    return Object.keys(cache).length;
}
