import type { Request, Response } from "express";
import {
  createStoredProduct,
  deleteStoredProduct,
  getStoredProduct,
  listStoredProducts,
  updateStoredProduct,
} from "@workspace/db";
import {
  ListProductsQueryParams,
  CreateProductBody,
  GetProductParams,
  UpdateProductParams,
  UpdateProductBody,
  DeleteProductParams,
  ListProductsResponse,
  GetProductResponse,
  CreateProductResponse,
  UpdateProductResponse,
} from "@workspace/api-zod";

export async function listProducts(req: Request, res: Response): Promise<void> {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const products = await listStoredProducts(query.data.category);
  res.json(ListProductsResponse.parse([...products].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())));
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  res.status(201).json(CreateProductResponse.parse(await createStoredProduct(parsed.data)));
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const product = await getStoredProduct(params.data.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductResponse.parse(product));
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const params = UpdateProductParams.safeParse(req.params);
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const product = await updateStoredProduct(params.data.id, parsed.data);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(UpdateProductResponse.parse(product));
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const params = DeleteProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await deleteStoredProduct(params.data.id))) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.sendStatus(204);
}
