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

const adminRequest = (options: RequestInit): RequestInit => ({
  ...options,
  credentials: 'same-origin',
  headers: { 'Content-Type': 'application/json', ...options.headers },
});

export async function uploadGalleryMedia(file: File): Promise<GalleryMedia> {
  const form = new FormData();
  form.append('file', file);
  return request<GalleryMedia>('/api/admin/gallery-media', {
    method: 'POST',
    body: form,
    credentials: 'same-origin',
  });
}

export const getGallery = () => request<GalleryItem[]>(galleryUrl);

export const createGalleryItem = (data: Pick<GalleryItem, 'media' | 'description'>) =>
  request<GalleryItem>(galleryUrl, adminRequest({
    method: 'POST',
    body: JSON.stringify(data),
  }));

export const updateGalleryItem = (id: number, data: Partial<Pick<GalleryItem, 'media' | 'description'>>) =>
  request<GalleryItem>(`${galleryUrl}/${id}`, adminRequest({
    method: 'PATCH',
    body: JSON.stringify(data),
  }));

export const reorderGalleryItems = (ids: number[]) =>
  request<GalleryItem[]>(`${galleryUrl}/reorder`, adminRequest({
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  }));

export const deleteGalleryItem = (id: number) =>
  request<void>(`${galleryUrl}/${id}`, adminRequest({ method: 'DELETE' }));
