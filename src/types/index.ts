// --- loyalty types ---

export type LoyaltyCardStatus = "active" | "reward_ready";

export enum ShopCategory {
    COFFEE = "coffee",
    FOOD = "food",
    TEA = "tea",
    OTHER = "other",
}

export interface User {
    id: string;
    telegram_id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    created_at: string;
    updated_at: string;
}

export interface CoffeeShop {
    id: string;
    name: string;
    slug: string;
    cashier_key_hash: string;
    stamp_threshold: number;
    created_at: string;
}

export interface LoyaltyCard {
    id: string;
    user_id: string;
    shop_id: string;
    stamp_count: number;
    status: LoyaltyCardStatus;
    total_stamps_earned: number;
    created_at: string;
    updated_at: string;
}

export interface Stamp {
    id: string;
    card_id: string;
    qr_token_hash?: string;
    added_at: string;
}

// --- api types ---

export interface QrCodeResponse {
    qrDataUrl: string;
    deepLink: string;
}

export interface UserQrResponse {
    qrDataUrl: string;
    expiresAt: number;
}

export interface StampRedeemRequest {
    qrToken: string;
    shopId: string;
    cashierKey: string;
}

export interface StampRedeemResponse {
    stamp: {
        cardId: string;
        newStampCount: number;
        isRewardReady: boolean;
        userName: string;
        stampThreshold: number;
    };
}

// --- telegram types ---

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}

export interface TelegramInitData {
    query_id?: string;
    user: TelegramUser;
    auth_date: number;
    hash: string;
}
