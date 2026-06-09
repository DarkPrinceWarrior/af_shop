export type LanguageCode = 'en' | 'ps' | 'zh-CN';
export type CurrencyCode = 'AFN' | 'CNY' | 'USD';

export interface CatalogCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface CatalogProductImage {
  id: string;
  image_path: string;
  alt: string | null;
  sort_order: number;
}

export interface CatalogProduct {
  id: string;
  category_id: string;
  sku: string | null;
  name: string;
  description: string | null;
  price: string;
  currency: CurrencyCode;
  stock_quantity: number;
  is_active: boolean;
  images: CatalogProductImage[];
}

export interface CatalogDeliveryPlace {
  id: string;
  name: string;
  description: string | null;
  image_path: string;
  delivery_fee: string;
  currency: CurrencyCode;
  sort_order: number;
  is_active: boolean;
}

export interface CatalogBootstrap {
  language: LanguageCode;
  currency: CurrencyCode;
  languages: LanguageCode[];
  currencies: CurrencyCode[];
  categories: CatalogCategory[];
  products: CatalogProduct[];
  delivery_places: CatalogDeliveryPlace[];
}

export interface OrderItemPayload {
  product_id: string;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  customer_phone: string;
  customer_telegram?: string | null;
  customer_comment?: string | null;
  language: LanguageCode;
  currency: CurrencyCode;
  delivery_place_id: string;
  items: OrderItemPayload[];
}

export interface OrderQuoteItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderQuote {
  currency: CurrencyCode;
  subtotal: string;
  delivery_fee: string;
  total: string;
  items: OrderQuoteItem[];
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name_en: string;
  product_name_ps: string;
  product_name_zh_cn: string;
  quantity: number;
  unit_price: string;
  line_total: string;
}

export interface OrderResponse {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_telegram: string | null;
  customer_comment: string | null;
  language: LanguageCode;
  currency: CurrencyCode;
  delivery_place_id: string;
  subtotal: string;
  delivery_fee: string;
  total: string;
  user_id: string | null;
  created_at: string | null;
  items?: OrderItem[];
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface OrdersList {
  data: OrderResponse[];
  count: number;
}

export type OrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'delivering'
  | 'completed'
  | 'cancelled';

export interface OrderStatusEvent {
  id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  comment: string | null;
  changed_by_user_id: string | null;
  created_at: string;
}

export interface OrderResponseFull extends OrderResponse {
  admin_comment?: string | null;
  stock_returned_at?: string | null;
  updated_at?: string;
  status_history?: OrderStatusEvent[];
  items: OrderItem[];
}

export interface AdminDashboard {
  products_count: number;
  active_products_count: number;
  low_stock_products_count: number;
  delivery_places_count: number;
  active_delivery_places_count: number;
  new_orders_count: number;
  active_orders_count: number;
}

export interface AdminCategory {
  id: string;
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminCategoryPayload {
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface AdminProductImage {
  id: string;
  product_id: string;
  image_path: string;
  alt_en: string | null;
  alt_ps: string | null;
  alt_zh_cn: string | null;
  sort_order: number;
}

export interface AdminProduct {
  id: string;
  category_id: string;
  sku: string | null;
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  description_en: string | null;
  description_ps: string | null;
  description_zh_cn: string | null;
  price_afn: string;
  price_cny: string;
  price_usd: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  images: AdminProductImage[];
}

export interface AdminProductPayload {
  category_id: string;
  sku?: string | null;
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  description_en?: string | null;
  description_ps?: string | null;
  description_zh_cn?: string | null;
  price_afn: string;
  price_cny: string;
  price_usd: string;
  stock_quantity: number;
  is_active?: boolean;
  primary_image_path?: string | null;
}

export interface AdminDeliveryPlace {
  id: string;
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  description_en: string | null;
  description_ps: string | null;
  description_zh_cn: string | null;
  image_path: string | null;
  fee_afn: string;
  fee_cny: string;
  fee_usd: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminDeliveryPlacePayload {
  name_en: string;
  name_ps: string;
  name_zh_cn: string;
  description_en?: string | null;
  description_ps?: string | null;
  description_zh_cn?: string | null;
  image_path?: string | null;
  fee_afn: string;
  fee_cny: string;
  fee_usd: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface PaginatedList<T> {
  data: T[];
  count: number;
}

export interface AdminUserPayload {
  email: string;
  password?: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface MediaUploadResponse {
  image_path: string;
}

export interface ProfileUpdatePayload {
  email?: string;
  full_name?: string | null;
}

export interface PasswordUpdatePayload {
  current_password: string;
  new_password: string;
}
