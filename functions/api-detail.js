// Soubor: functions/api-detail.js

export async function onRequest(context) {
    const AIRTABLE_TOKEN = context.env.AIRTABLE_API_KEY; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    
    const url = new URL(context.request.url);
    const produktId = url.searchParams.get('id');

    if (!produktId) {
        return new Response("Chybí ID produktu", { status: 400 });
    }

    const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${produktId}`;

    // 1. Otevření mezipaměti Cloudflare
    const cache = caches.default;
    const cacheKey = new Request(context.request.url, context.request);

    let response = await cache.match(cacheKey);

    // 2. Pokud detail v mezipaměti není, stáhneme ho z Airtable
    if (!response) {
        try {
            const airtableResponse = await fetch(AIRTABLE_URL, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_TOKEN}`
                }
            });

            if (!airtableResponse.ok) {
                return new Response("Produkt nenalezen", { status: airtableResponse.status });
            }

            const data = await airtableResponse.json();

            response = new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=60, s-maxage=300'
                }
            });

            // Uložíme do mezipaměti
            context.waitUntil(cache.put(cacheKey, response.clone()));

        } catch (error) {
            return new Response("Interní chyba serveru", { status: 500 });
        }
    }

    return response;
}
