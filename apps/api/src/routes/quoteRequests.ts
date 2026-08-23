import { Router, type IRouter } from "express";
import { requireAdmin } from "../middlewares/adminAuth";
import {
  listQuoteRequests,
  createQuoteRequest,
  getQuoteRequestSummary,
  getQuoteRequest,
  updateQuoteRequest,
  deleteQuoteRequest,
} from "../controllers/quoteRequestsController";

const router: IRouter = Router();

router.get("/quote-requests", requireAdmin, listQuoteRequests);
router.post("/quote-requests", createQuoteRequest);
router.get("/quote-requests/summary", requireAdmin, getQuoteRequestSummary);
router.get("/quote-requests/:id", requireAdmin, getQuoteRequest);
router.patch("/quote-requests/:id", requireAdmin, updateQuoteRequest);
router.delete("/quote-requests/:id", requireAdmin, deleteQuoteRequest);

export default router;
