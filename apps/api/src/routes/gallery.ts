import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import {
  createGalleryItem,
  deleteGalleryItem,
  listGalleryItems,
  reorderGalleryItems,
  updateGalleryItem,
} from "../controllers/galleryController";

const router: IRouter = Router();

router.get("/gallery", listGalleryItems);
router.post("/gallery", requireAdmin, createGalleryItem);
router.patch("/gallery/reorder", requireAdmin, reorderGalleryItems);
router.patch("/gallery/:id", requireAdmin, updateGalleryItem);
router.delete("/gallery/:id", requireAdmin, deleteGalleryItem);

export default router;
