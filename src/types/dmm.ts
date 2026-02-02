export interface DmmImageURL {
    list?: string;
    small?: string;
    large?: string;
}

export interface DmmItemInfo {
    genre?: { id: number; name: string }[];
    maker?: { id: number; name: string }[];
    actress?: { id: number; name: string; ruby?: string }[];
    director?: { id: number; name: string }[];
    label?: { id: number; name: string }[];
    series?: { id: number; name: string }[];
}

export interface DmmItem {
    content_id: string;
    product_id: string;
    title: string;
    URL: string;
    affiliateURL: string; // Used for direct affiliate link
    imageURL?: DmmImageURL;
    sampleMovieURL?: { [key: string]: string }; // Indicates presence of sample video
    date: string; // Release date
    iteminfo?: DmmItemInfo;
    [key: string]: any;
}

export interface DmmItemListResponse {
    result: {
        status: number;
        result_count: number;
        total_count: number;
        first_position: number;
        items: DmmItem[];
    };
}

// Actress Search Types
export interface DmmActressImageURL {
    small?: string;
    large?: string;
}

export interface DmmActress {
    id: number;
    name: string;
    ruby: string;
    bust?: number;
    cup?: string;
    waist?: number;
    hip?: number;
    height?: number;
    birthday?: string;
    blood_type?: string;
    hobby?: string;
    prefectures?: string;
    imageURL?: DmmActressImageURL;
    listURL?: DmmImageURL; // Sometimes structure varies
}

export interface DmmActressSearchResponse {
    result: {
        status: number;
        result_count: number;
        total_count: number;
        first_position: number;
        actress: DmmActress[];
    };
}
