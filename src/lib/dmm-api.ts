import { DmmItemListResponse, DmmItem, DmmActressSearchResponse, DmmActress } from '../types/dmm';

// Removed top-level env access
const DMM_API_BASE_ITEM = "https://api.dmm.com/affiliate/v3/ItemList";
const DMM_API_BASE_ACTRESS = "https://api.dmm.com/affiliate/v3/ActressSearch";

function getBaseParams() {
    const apiId = process.env.DMM_API_ID;
    const affiliateId = process.env.DMM_AFFILIATE_ID;

    if (!apiId || !affiliateId) {
        console.error("Missing Env Vars:", { API_ID: !!apiId, AFFILIATE: !!affiliateId });
        throw new Error("DMM API ID or Affiliate ID is not set in environment variables.");
    }
    return {
        api_id: apiId,
        affiliate_id: affiliateId,
        output: 'json',
    };
}

export async function fetchActressItems(
    actressId: string,
    hits: number = 100,
    keyword: string = 'VR',
    sort: string = 'rank'
): Promise<DmmItem[]> {
    let allItems: DmmItem[] = [];
    let offset = 1;
    let hasMore = true;
    const MAX_PAGES = 20; // Limit to ~2000 items for general search to prevent timeouts

    try {
        let page = 0;
        while (hasMore && page < MAX_PAGES) {
            const params = new URLSearchParams({
                ...getBaseParams(),
                site: 'FANZA',
                service: 'digital',
                floor: 'videoa',
                hits: hits.toString(), // Usually 100
                offset: offset.toString(),
                sort: sort,
                keyword: keyword,
                article: 'actress',
                article_id: actressId,
            });

            const url = `${DMM_API_BASE_ITEM}?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                // If API errors on a page, stop paging but return what we have
                console.warn(`API Error in fetchActressItems (Page ${page + 1}): ${response.status}`);
                break;
            }

            const data: DmmItemListResponse = await response.json();
            const items = data.result?.items || [];

            // DMM API behavior: if offset > total, it might return empty list or error
            if (items.length > 0) {
                // Filter validation (must have sample)
                const validBatch = items.filter(item => item.sampleMovieURL);
                allItems = [...allItems, ...validBatch];

                // Prepare next page
                offset += hits;
                page++;

                // If we got fewer than requested, we are done
                if (items.length < hits) {
                    hasMore = false;
                } else {
                    // Small delay to prevent rate limit during heavy paging
                    await new Promise(r => setTimeout(r, 100));
                }
            } else {
                hasMore = false;
            }
        }
        return allItems;
    } catch (error) {
        console.error("Error fetching items from DMM API:", error);
        return allItems; // Return whatever we found so far
    }
}

export async function fetchNewestVRVideos(
    hits: number = 100,
    offset: number = 1,
    keyword: string = 'VR'
): Promise<DmmItem[]> {
    try {
        const params = new URLSearchParams({
            ...getBaseParams(),
            site: 'FANZA',
            service: 'digital',
            floor: 'videoa',
            hits: hits.toString(),
            offset: offset.toString(),
            sort: 'date',
            keyword: keyword,
        });

        const url = `${DMM_API_BASE_ITEM}?${params.toString()}`;
        console.log(`Fetching Newest VR Videos: ${url.replace(params.get('api_id')!, '***').replace(params.get('affiliate_id')!, '***')}`);

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DMM API Error (${response.status}): ${response.statusText} - ${errorText}`);
        }

        const data: DmmItemListResponse = await response.json();
        return data.result?.items || [];
    } catch (error) {
        console.error("Error fetching newest items from DMM API:", error);
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

// ... existing code ...
export async function fetchAllActressesByInitial(initial: string): Promise<DmmActress[]> {
    // ... existing implementation ...
    let allActresses: DmmActress[] = [];
    let offset = 1;
    let hasMore = true;
    const MAX_FETCH_COUNT = 5000;

    try {
        console.log(`Starting fetch for initial: ${initial}`);
        while (hasMore && allActresses.length < MAX_FETCH_COUNT) {
            const actresses = await fetchActresses(initial, 100, offset);

            if (actresses.length === 0) {
                hasMore = false;
            } else {
                allActresses = [...allActresses, ...actresses];
                console.log(`Fetched ${actresses.length} actresses (Total: ${allActresses.length})`);
                offset += 100;
                await delay(DELAY_MS);
            }
        }
        console.log(`Finished fetching. Total actresses for '${initial}': ${allActresses.length}`);
        return allActresses;

    } catch (error) {
        console.error(`Failed to fetch actresses for initial '${initial}'. Using fallback data for build. Error:`, error);
        return allActresses;
    }
}

/**
 * Fetches ALL "videoa" (Adult Video) items for an actress using pagination.
 * Does NOT use keyword filtering to ensure we don't miss items with poor metadata.
 */
export async function fetchFullActressVideoList(actressId: string): Promise<DmmItem[]> {
    let allItems: DmmItem[] = [];
    let offset = 1;
    let hasMore = true;
    const MAX_PAGES = 50; // Safety limit (5000 videos)

    console.log(`Fetching FULL video list for ID: ${actressId}`);

    try {
        let page = 0;
        while (hasMore && page < MAX_PAGES) {
            const params = new URLSearchParams({
                ...getBaseParams(),
                site: 'FANZA',
                service: 'digital',
                floor: 'videoa',
                hits: '100',
                offset: offset.toString(),
                sort: 'date',
                article: 'actress',
                article_id: actressId,
            });

            const url = `${DMM_API_BASE_ITEM}?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.warn(`Failed to fetch page ${page + 1} for ${actressId}: ${response.status}`);
                break;
            }

            const data: DmmItemListResponse = await response.json();
            const items = data.result?.items || [];

            if (items.length > 0) {
                allItems = [...allItems, ...items];
                // console.log(`  -> Page ${page + 1}: +${items.length} items`);
                offset += 100;
                page++;
                await delay(100); // Small delay between pages
            } else {
                hasMore = false;
            }
        }
        return allItems;
    } catch (error) {
        console.error(`Error in fetchFullActressVideoList for ${actressId}:`, error);
        return [];
    }
}

