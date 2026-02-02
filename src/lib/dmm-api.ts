import { DmmItemListResponse, DmmItem, DmmActressSearchResponse, DmmActress } from '@/types/dmm';

const DMM_API_ID = process.env.DMM_API_ID!;
const DMM_AFFILIATE_ID = process.env.DMM_AFFILIATE_ID!;
const DMM_API_BASE_ITEM = "https://api.dmm.com/affiliate/v3/ItemList";
const DMM_API_BASE_ACTRESS = "https://api.dmm.com/affiliate/v3/ActressSearch";

function getBaseParams() {
    if (!DMM_API_ID || !DMM_AFFILIATE_ID) {
        throw new Error("DMM API ID or Affiliate ID is not set in environment variables.");
    }
    return {
        api_id: DMM_API_ID,
        affiliate_id: DMM_AFFILIATE_ID,
        output: 'json',
    };
}

export async function fetchActressItems(actressId: string, hits: number = 100): Promise<DmmItem[]> {
    try {
        const params = new URLSearchParams({
            ...getBaseParams(),
            site: 'FANZA',
            service: 'digital',
            floor: 'videoa',
            hits: '50',
            sort: 'rank',
            keyword: 'VR',
            article: 'actress',
            article_id: actressId,
        });

        const url = `${DMM_API_BASE_ITEM}?${params.toString()}`;
        console.log(`Fetching Items: ${url.replace(params.get('api_id')!, '***').replace(params.get('affiliate_id')!, '***')}`);

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DMM API Error (${response.status}): ${response.statusText} - ${errorText}`);
        }

        const data: DmmItemListResponse = await response.json();
        const items = data.result?.items || [];
        const validItems = items.filter(item => item.sampleMovieURL);
        return validItems.slice(0, 10);
    } catch (error) {
        console.error("Error fetching items from DMM API:", error);
        return [];
    }
}

export async function fetchActresses(initial: string, hits: number = 20, offset: number = 1): Promise<DmmActress[]> {
    try {
        const params = new URLSearchParams({
            ...getBaseParams(),
            initial: initial,
            hits: hits.toString(),
            offset: offset.toString(),
        });

        const url = `${DMM_API_BASE_ACTRESS}?${params.toString()}`;
        console.log(`Fetching Actresses: ${url.replace(params.get('api_id')!, '***').replace(params.get('affiliate_id')!, '***')}`);

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DMM API Error (${response.status}): ${response.statusText} - ${errorText}`);
        }

        const data: DmmActressSearchResponse = await response.json();
        const actresses = data.result?.actress || [];
        return actresses.filter(a => a.imageURL?.large || a.imageURL?.small);
    } catch (error) {
        console.error("Error fetching actresses from DMM API:", error);
        throw error;
    }
}

export async function fetchActressProfile(id: string): Promise<DmmActress | null> {
    try {
        const params = new URLSearchParams({
            ...getBaseParams(),
            actress_id: id,
        });

        const url = `${DMM_API_BASE_ACTRESS}?${params.toString()}`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data: DmmActressSearchResponse = await response.json();
        return data.result?.actress?.[0] || null;
    } catch (error) {
        console.error(`Error fetching profile for ${id}:`, error);
        return null;
    }
}

const DELAY_MS = 100;

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchAllActressesByInitial(initial: string): Promise<DmmActress[]> {
    let allActresses: DmmActress[] = [];
    let offset = 1;
    let hasMore = true;
    const MAX_FETCH_COUNT = 1000; // Safety limit to prevent infinite loops

    try {
        console.log(`Starting fetch for initial: ${initial}`);
        while (hasMore && allActresses.length < MAX_FETCH_COUNT) {
            // Fetch 100 items at a time
            const actresses = await fetchActresses(initial, 100, offset);

            if (actresses.length === 0) {
                hasMore = false;
            } else {
                allActresses = [...allActresses, ...actresses];
                console.log(`Fetched ${actresses.length} actresses (Total: ${allActresses.length})`);

                // If we got fewer than requested (100), we've reached the end
                // Note: The filter inside fetchActresses might reduce the count, 
                // so we should rely on the raw response size if possible, 
                // but checking if we got *any* results is a safe basic check.
                // A more robust check might require checking result_count from response, 
                // but for now, let's increment offset by 100.
                offset += 100;

                // Be polite to the API
                await delay(DELAY_MS);
            }
        }

        console.log(`Finished fetching. Total actresses for '${initial}': ${allActresses.length}`);
        return allActresses;

    } catch (error) {
        console.error(`Failed to fetch actresses for initial '${initial}'. Using fallback data for build. Error:`, error);
        // Return whatever we managed to fetch so far, or empty
        return allActresses;
    }
}
