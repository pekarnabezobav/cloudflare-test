export async function onRequest(context) {
    const AIRTABLE_TOKEN = context.env.AIRTABLE_API_KEY; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    
    // Získání ID produktu z adresy (např. z /api-detail?id=rec12345)
    const url = new URL(context.request.url);
    const produktId = url.searchParams.get('id');

    if (!produktId) {
        return new Response("Chybí ID produktu", { status: 400 });
    }

    const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${produktId}`;

    try {
        const response = await fetch(AIRTABLE_URL, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        if (!response.ok) {
           return new Response("Produkt nenalezen", { status: response.status });
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response("Interní chyba serveru", { status: 500 });
    }
}