import 'dotenv/config';

// Server
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const PUBLIC_PATH = 'public';
export const STATIC_PATH = '/static';

// Pagination
export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Sort Options
export const SORT_OPTIONS = {
  RECENT: 'recent',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
} as const;

// JWT 설정
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_secret_key';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
export const ACCESS_TOKEN_EXPIRY = '1h'; // Access Token 만료 시간
export const REFRESH_TOKEN_EXPIRY = '7d'; // Refresh Token 만료 시간
export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken'; // Refresh Token이 저장될 쿠키 이름