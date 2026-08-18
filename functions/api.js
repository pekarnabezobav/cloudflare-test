// Soubor: functions/api.js

export async function onRequest(context) {
    const AIRTABLE_TOKEN = context.env.AIRTABLE_API_KEY; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    const DOTAZ = '{Na webu}=1';
    
    const URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(DOTAZ)}`;

    // 1. Otevření mezipaměti Cloudflare
    const cache = caches.default;
    const cacheKey = new Request(context.request.url, context.request);
    
    // Zkusíme najít odpověď v mezipaměti
    let response = await cache.match(cacheKey);

    // 2. Pokud odpověď v mezipaměti není, sáhneme do Airtable
    if (!response) {
        try {
            const airtableResponse = await fetch(URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`
                }
            });

            if (!airtableResponse.ok) {
                return new Response("Chyba při komunikaci s Airtable", { status: airtableResponse.status });
            }

            const data = await airtableResponse.json();

            // Vytvoříme novou odpověď a nastavíme platnost mezipaměti (300 sekund = 5 minut)
            response = new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=60, s-maxage=300' 
                }
            });

            // Uložíme do Cloudflare mezipaměti pro další návštěvníky
            context.waitUntil(cache.put(cacheKey, response.clone()));

        } catch (error) {
            return new Response("Interní chyba serveru", { status: 500 });
        }
    }

    return response;
}
