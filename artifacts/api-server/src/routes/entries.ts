import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  getEntriesForUser,
  createEntry,
  deleteEntry,
} from "../adapters/repositories/entryRepository";

const router = Router();

function formatEntry(e: {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColour: string | null;
  amount: string;
  description: string | null;
  inputMethod: string;
  entryDate: string;
  createdAt: Date;
}) {
  return {
    id: e.id,
    userId: e.userId,
    categoryId: e.categoryId,
    categoryName: e.categoryName,
    categoryIcon: e.categoryIcon,
    categoryColour: e.categoryColour,
    amount: Number(e.amount),
    description: e.description,
    inputMethod: e.inputMethod,
    entryDate: e.entryDate,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const { startDate, endDate, categoryId } = req.query;
  const entries = await getEntriesForUser(req.user!.userId, {
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    categoryId: categoryId as string | undefined,
  });
  res.json(entries.map(formatEntry));
});

router.post("/", requireAuth, async (req, res) => {
  const { categoryId, amount, description, inputMethod, entryDate } = req.body;

  if (!categoryId || !amount || !inputMethod) {
    res.status(400).json({ error: "categoryId, amount, and inputMethod are required" });
    return;
  }

  const today = new Date().toISOString().split("T")[0]!;

  const entry = await createEntry({
    userId: req.user!.userId,
    categoryId,
    amount: Number(amount),
    description: description ?? null,
    inputMethod,
    entryDate: entryDate ?? today,
  });

  const entries = await getEntriesForUser(req.user!.userId, { startDate: entry.entryDate, endDate: entry.entryDate });
  const full = entries.find((e) => e.id === entry.id);

  res.status(201).json(
    full
      ? formatEntry(full)
      : {
          id: entry.id,
          userId: entry.userId,
          categoryId: entry.categoryId,
          categoryName: null,
          categoryIcon: null,
          categoryColour: null,
          amount: Number(entry.amount),
          description: entry.description,
          inputMethod: entry.inputMethod,
          entryDate: entry.entryDate,
          createdAt: entry.createdAt.toISOString(),
        }
  );
});

router.delete("/:id", requireAuth, async (req, res) => {
  await deleteEntry(req.params["id"]!, req.user!.userId);
  res.json({ success: true, message: "Entry deleted" });
});

export default router;
