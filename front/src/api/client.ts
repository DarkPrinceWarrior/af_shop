import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminDashboard,
  AdminDeliveryPlace,
  AdminDeliveryPlacePayload,
  AdminProduct,
  AdminProductPayload,
  AdminTelegramSettings,
  AdminTelegramSettingsPayload,
  AdminUserPayload,
  AuthToken,
  AuthUser,
  CatalogBootstrap,
  CurrencyCode,
  LanguageCode,
  MediaUploadResponse,
  OrderPayload,
  OrderQuote,
  OrderResponse,
  OrderResponseFull,
  OrderStatus,
  OrdersList,
  PaginatedList,
  PasswordUpdatePayload,
  ProfileUpdatePayload,
  SignupPayload,
} from './types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').trim();
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, '');
const API_PREFIX = '/api/v1';

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const url = `${API_BASE_URL}${API_PREFIX}${path}`;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(url, { ...init, headers });
  } catch (err) {
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0,
      err,
    );
  }

  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text().catch(() => null);
    }
    const message = extractErrorMessage(detail) ?? response.statusText;
    throw new ApiError(message, response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

function extractErrorMessage(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object' && detail !== null) {
    const obj = detail as Record<string, unknown>;
    const d = obj.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length > 0) {
      const first = d[0] as Record<string, unknown>;
      if (typeof first?.msg === 'string') return first.msg;
    }
  }
  return null;
}

export function fetchBootstrap(
  language: LanguageCode,
  currency: CurrencyCode,
  signal?: AbortSignal,
): Promise<CatalogBootstrap> {
  const params = new URLSearchParams({ language, currency });
  return request<CatalogBootstrap>(`/catalog/bootstrap?${params.toString()}`, {
    signal,
  });
}

export function quoteOrder(
  payload: OrderPayload,
  token?: string | null,
): Promise<OrderQuote> {
  return request<OrderQuote>('/catalog/orders/quote', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function createOrder(
  payload: OrderPayload,
  token?: string | null,
): Promise<OrderResponse> {
  return request<OrderResponse>('/catalog/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function login(email: string, password: string): Promise<AuthToken> {
  const body = new URLSearchParams({ username: email, password });
  return request<AuthToken>('/login/access-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

export function signup(payload: SignupPayload): Promise<AuthUser> {
  return request<AuthUser>('/users/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(token: string): Promise<AuthUser> {
  return request<AuthUser>('/users/me', { token });
}

export function fetchMyOrders(token: string): Promise<OrdersList> {
  return request<OrdersList>('/catalog/orders/me', { token });
}

export function fetchMyOrder(
  token: string,
  orderId: string,
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/catalog/orders/me/${orderId}`, { token });
}

export function updateCurrentUser(
  token: string,
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  return request<AuthUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateCurrentPassword(
  token: string,
  payload: PasswordUpdatePayload,
): Promise<{ message: string }> {
  return request<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function fetchAdminDashboard(token: string): Promise<AdminDashboard> {
  return request<AdminDashboard>('/admin/dashboard', { token });
}

export interface AdminOrdersFilters {
  skip?: number;
  limit?: number;
  status?: OrderStatus;
  q?: string;
  date_from?: string;
  date_to?: string;
}

export function fetchAdminOrders(
  token: string,
  filters: AdminOrdersFilters = {},
): Promise<OrdersList> {
  const params = new URLSearchParams();
  if (filters.skip !== undefined) params.set('skip', String(filters.skip));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  if (filters.q) params.set('q', filters.q);
  if (filters.date_from) params.set('date_from', filters.date_from);
  if (filters.date_to) params.set('date_to', filters.date_to);
  const qs = params.toString();
  return request<OrdersList>(`/admin/orders${qs ? `?${qs}` : ''}`, { token });
}

export function fetchAdminOrder(
  token: string,
  orderId: string,
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/admin/orders/${orderId}`, { token });
}

export function updateAdminOrderStatus(
  token: string,
  orderId: string,
  payload: { status: OrderStatus; admin_comment?: string | null },
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateAdminOrderComment(
  token: string,
  orderId: string,
  admin_comment: string | null,
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/admin/orders/${orderId}/comment`, {
    method: 'PATCH',
    body: JSON.stringify({ admin_comment }),
    token,
  });
}

export function cancelAdminOrder(
  token: string,
  orderId: string,
  admin_comment?: string | null,
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/admin/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ admin_comment: admin_comment ?? null }),
    token,
  });
}

export function completeAdminOrder(
  token: string,
  orderId: string,
  admin_comment?: string | null,
): Promise<OrderResponseFull> {
  return request<OrderResponseFull>(`/admin/orders/${orderId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ admin_comment: admin_comment ?? null }),
    token,
  });
}

export function fetchAdminCategories(
  token: string,
): Promise<PaginatedList<AdminCategory>> {
  return request<PaginatedList<AdminCategory>>('/admin/categories', { token });
}

export function createAdminCategory(
  token: string,
  payload: AdminCategoryPayload,
): Promise<AdminCategory> {
  return request<AdminCategory>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateAdminCategory(
  token: string,
  id: string,
  payload: Partial<AdminCategoryPayload>,
): Promise<AdminCategory> {
  return request<AdminCategory>(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function deleteAdminCategory(token: string, id: string): Promise<void> {
  return request<void>(`/admin/categories/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminProducts(
  token: string,
): Promise<PaginatedList<AdminProduct>> {
  return request<PaginatedList<AdminProduct>>('/admin/products', { token });
}

export function createAdminProduct(
  token: string,
  payload: AdminProductPayload,
): Promise<AdminProduct> {
  return request<AdminProduct>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateAdminProduct(
  token: string,
  id: string,
  payload: Partial<AdminProductPayload>,
): Promise<AdminProduct> {
  return request<AdminProduct>(`/admin/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function deleteAdminProduct(token: string, id: string): Promise<void> {
  return request<void>(`/admin/products/${id}`, { method: 'DELETE', token });
}

export function fetchAdminDeliveryPlaces(
  token: string,
): Promise<PaginatedList<AdminDeliveryPlace>> {
  return request<PaginatedList<AdminDeliveryPlace>>('/admin/delivery-places', {
    token,
  });
}

export function createAdminDeliveryPlace(
  token: string,
  payload: AdminDeliveryPlacePayload,
): Promise<AdminDeliveryPlace> {
  return request<AdminDeliveryPlace>('/admin/delivery-places', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateAdminDeliveryPlace(
  token: string,
  id: string,
  payload: Partial<AdminDeliveryPlacePayload>,
): Promise<AdminDeliveryPlace> {
  return request<AdminDeliveryPlace>(`/admin/delivery-places/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function deleteAdminDeliveryPlace(
  token: string,
  id: string,
): Promise<void> {
  return request<void>(`/admin/delivery-places/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function fetchAdminUsers(
  token: string,
): Promise<PaginatedList<AuthUser>> {
  return request<PaginatedList<AuthUser>>('/users/', { token });
}

export function createAdminUser(
  token: string,
  payload: AdminUserPayload,
): Promise<AuthUser> {
  return request<AuthUser>('/users/', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });
}

export function updateAdminUser(
  token: string,
  userId: string,
  payload: Partial<AdminUserPayload>,
): Promise<AuthUser> {
  return request<AuthUser>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    token,
  });
}

export function deleteAdminUser(token: string, userId: string): Promise<void> {
  return request<void>(`/users/${userId}`, { method: 'DELETE', token });
}

export async function uploadMedia(
  token: string,
  file: File,
): Promise<MediaUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  return request<MediaUploadResponse>('/admin/media/images', {
    method: 'POST',
    body: form,
    token,
  });
}

export function openAdminOrdersSocket(token: string): WebSocket {
  const wsBase = API_BASE_URL.replace(/^http/i, 'ws');
  const url = `${wsBase}${API_PREFIX}/admin/orders/ws?token=${encodeURIComponent(token)}`;
  return new WebSocket(url);
}

export function fetchTelegramSettings(
  token: string,
): Promise<AdminTelegramSettings> {
  return request<AdminTelegramSettings>('/admin/telegram-settings', { token });
}

export function updateTelegramSettings(
  token: string,
  payload: AdminTelegramSettingsPayload,
): Promise<AdminTelegramSettings> {
  return request<AdminTelegramSettings>('/admin/telegram-settings', {
    method: 'PUT',
    body: JSON.stringify(payload),
    token,
  });
}

export function testTelegramSettings(
  token: string,
): Promise<{ message: string }> {
  return request<{ message: string }>('/admin/telegram-settings/test', {
    method: 'POST',
    token,
  });
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  return `${API_BASE_URL}/${path}`;
}
