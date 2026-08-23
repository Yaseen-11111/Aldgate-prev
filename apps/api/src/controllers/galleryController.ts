import type { Request, Response } from "express";
import {
  createStoredGalleryItem,
  deleteStoredGalleryItem,
  listStoredGalleryItems,
  reorderStoredGalleryItems,
  updateStoredGalleryItem,
} from "@workspace/db";
import type { GalleryMediaRecord } from "@workspace/db";

function numericId(value: string | string[] | undefined): number | undefined {
  if (typeof value !== "string") return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validMedia(value: unknown): value is GalleryMediaRecord[] {
  return Array.isArray(value) && value.length > 0 && value.every((item) =>
    typeof item === "object" && item !== null &&
    isNonEmptyString((item as { src?: unknown }).src) &&
    ((item as { type?: unknown }).type === "image" || (item as { type?: unknown }).type === "video"),
  );
}

export async function listGalleryItems(_req: Request, res: Response): Promise<void> {
  res.json(await listStoredGalleryItems());
}

export async function createGalleryItem(req: Request, res: Response): Promise<void> {
  const { media, description = "" } = req.body as { media?: unknown; description?: unknown };
  if (!validMedia(media) || typeof description !== "string") {
    res.status(400).json({ error: "At least one image or video and an optional text description are required." });
    return;
  }
  res.status(201).json(await createStoredGalleryItem({ media, description }));
}

export async function updateGalleryItem(req: Request, res: Response): Promise<void> {
  const id = numericId(req.params.id);
  const { media, description } = req.body as { media?: unknown; description?: unknown };
  if (!id || (media !== undefined && !validMedia(media)) || (description !== undefined && typeof description !== "string")) {
    res.status(400).json({ error: "Invalid gallery item." });
    return;
  }
  const item = await updateStoredGalleryItem(id, {
    ...(media === undefined ? {} : { media }),
    ...(description === undefined ? {} : { description }),
  });
  if (!item) {
    res.status(404).json({ error: "Gallery item not found." });
    return;
  }
  res.json(item);
}

export async function reorderGalleryItems(req: Request, res: Response): Promise<void> {
  const { ids } = req.body as { ids?: unknown };
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "number" && Number.isInteger(id))) {
    res.status(400).json({ error: "A complete ordered list of gallery item IDs is required." });
    return;
  }
  const items = await reorderStoredGalleryItems(ids);
  if (!items) {
    res.status(400).json({ error: "Gallery item IDs did not match the current gallery." });
    return;
  }
  res.json(items);
}

export async function deleteGalleryItem(req: Request, res: Response): Promise<void> {
  const id = numericId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid gallery item." });
    return;
  }
  if (!(await deleteStoredGalleryItem(id))) {
    res.status(404).json({ error: "Gallery item not found." });
    return;
  }
  res.sendStatus(204);
}
