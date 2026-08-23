import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController";

const router: IRouter = Router();

router.get("/products", listProducts);
router.post("/products", requireAdmin, createProduct);
router.get("/products/:id", getProduct);
router.patch("/products/:id", requireAdmin, updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

export default router;
