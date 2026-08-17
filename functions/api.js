export async function onRequest(context) {
    // Získání tajného klíče z nastavení Cloudflare
    const AIRTABLE_TOKEN = context.env.AIRTABLE_API_KEY; 
    const BASE_ID = 'app81BJfSOvz5luMr';
    const TABLE_NAME = 'Produkty';
    const DOTAZ = '{Na webu}=1';
    
    const URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}?filterByFormula=${encodeURIComponent(DOTAZ)}`;

    try {
        const response = await fetch(URL, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`
            }
        });

        if (!response.ok) {
           return new Response("Chyba při komunikaci s databází", { status: response.status });
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response("Interní chyba serveru", { status: 500 });
    }
}