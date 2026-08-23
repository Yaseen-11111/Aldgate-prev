import type { Request, Response } from "express";
import {
  createStoredQuoteRequest,
  deleteStoredQuoteRequest,
  getStoredQuoteRequest,
  listStoredQuoteRequests,
  updateStoredQuoteRequest,
} from "@workspace/db";
import {
  CreateQuoteRequestBody,
  ListQuoteRequestsResponse,
  CreateQuoteRequestResponse,
  GetQuoteRequestSummaryResponse,
  GetQuoteRequestParams,
  GetQuoteRequestResponse,
  UpdateQuoteRequestParams,
  UpdateQuoteRequestBody,
  UpdateQuoteRequestResponse,
  DeleteQuoteRequestParams,
} from "@workspace/api-zod";

export async function listQuoteRequests(_req: Request, res: Response): Promise<void> {
  const requests = await listStoredQuoteRequests();
  res.json(ListQuoteRequestsResponse.parse([...requests].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())));
}

export async function createQuoteRequest(req: Request, res: Response): Promise<void> {
  const parsed = CreateQuoteRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { preferredDate, widthCm, dropCm, ...rest } = parsed.data;
  const request = await createStoredQuoteRequest({
    ...rest,
    preferredDate: new Date(preferredDate),
    widthCm: widthCm ?? null,
    dropCm: dropCm ?? null,
  });
  res.status(201).json(CreateQuoteRequestResponse.parse(request));
}

export async function getQuoteRequestSummary(_req: Request, res: Response): Promise<void> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const requests = await listStoredQuoteRequests();
  res.json(GetQuoteRequestSummaryResponse.parse({
    totalPending: requests.filter((request) => request.status === "pending").length,
    totalThisWeek: requests.filter((request) => request.createdAt >= weekAgo).length,
    totalItemsRequested: requests.reduce((sum, request) => sum + request.items.length, 0),
  }));
}

export async function getQuoteRequest(req: Request, res: Response): Promise<void> {
  const params = GetQuoteRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const request = await getStoredQuoteRequest(params.data.id);
  if (!request) {
    res.status(404).json({ error: "Quote request not found" });
    return;
  }
  res.json(GetQuoteRequestResponse.parse(request));
}

export async function updateQuoteRequest(req: Request, res: Response): Promise<void> {
  const params = UpdateQuoteRequestParams.safeParse(req.params);
  const parsed = UpdateQuoteRequestBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { preferredDate, ...rest } = parsed.data;
  const request = await updateStoredQuoteRequest(params.data.id, {
    ...rest,
    ...(preferredDate === undefined ? {} : { preferredDate: new Date(preferredDate) }),
  });
  if (!request) {
    res.status(404).json({ error: "Quote request not found" });
    return;
  }
  res.json(UpdateQuoteRequestResponse.parse(request));
}

export async function deleteQuoteRequest(req: Request, res: Response): Promise<void> {
  const params = DeleteQuoteRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!(await deleteStoredQuoteRequest(params.data.id))) {
    res.status(404).json({ error: "Quote request not found" });
    return;
  }
  res.sendStatus(204);
}
