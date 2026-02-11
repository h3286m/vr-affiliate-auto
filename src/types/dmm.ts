export interface DmmImageURL {
    list?: string;
    small?: string;
    large?: string;
}

export interface DmmItemInfo {
    genre?: { id: number; name: string }[];
    maker?: { id: number; name: string }[];
    actress?: { id: number | string; name: string; ruby?: string }[];
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
    sampleMovieURL?: { [key: string]: string | number }; // Indicates presence of sample video
    date: string; // Release date
    iteminfo?: DmmItemInfo;
    review_count?: number;
    review_average?: number;
    description?: string; // Generated description
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
    id: number | string;
    name: string;
    ruby: string;
    bust?: number | string | null;
    cup?: string | null;
    waist?: number | string | null;
    hip?: number | string | null;
    height?: number | string | null;
    birthday?: string | null;
    blood_type?: string | null;
    hobby?: string | null;
    prefectures?: string | null;
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
