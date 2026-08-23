import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import adminRouter from "./admin";
import quoteRequestsRouter from "./quoteRequests";
import galleryRouter from "./gallery";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(adminRouter);
router.use(quoteRequestsRouter);
router.use(galleryRouter);

export default router;
