export type GalleryMedia = {
  src: string;
  type: 'image' | 'video';
};

export type GalleryItem = {
  id: number;
  media: GalleryMedia[];
  description: string;
  createdAt: string;
};

const galleryUrl = '/api/gallery';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unable to update gallery.' }));
    throw new Error(body.error ?? 'Unable to update gallery.');
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

function adminHeaders(): HeadersInit {
  const token = sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const getGallery = () => request<GalleryItem[]>(galleryUrl);

export const createGalleryItem = (data: Pick<GalleryItem, 'media' | 'description'>) =>
  request<GalleryItem>(galleryUrl, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });

export const updateGalleryItem = (id: number, data: Partial<Pick<GalleryItem, 'media' | 'description'>>) =>
  request<GalleryItem>(`${galleryUrl}/${id}`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });

export const reorderGalleryItems = (ids: number[]) =>
  request<GalleryItem[]>(`${galleryUrl}/reorder`, {
    method: 'PATCH',
    headers: adminHeaders(),
    body: JSON.stringify({ ids }),
  });

export const deleteGalleryItem = (id: number) =>
  request<void>(`${galleryUrl}/${id}`, { method: 'DELETE', headers: adminHeaders() });
