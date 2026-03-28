import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import {
  getCategoriesForUser,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../adapters/repositories/budgetRepository";
import { getEntriesForUser } from "../adapters/repositories/entryRepository";
import { getCategoryStatus } from "../domain/budget/categoryStatus";

const router = Router();

function getWeekDateRange() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return {
    startDate: weekStart.toISOString().split("T")[0]!,
    endDate: weekEnd.toISOString().split("T")[0]!,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const categories = await getCategoriesForUser(req.user!.userId);
  res.json(
    categories.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      monthlyBudget: Number(c.monthlyBudget),
      colour: c.colour,
      icon: c.icon,
      createdAt: c.createdAt.toISOString(),
    }))
  );
});

router.get("/status", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const categories = await getCategoriesForUser(userId);
  const { startDate, endDate } = getWeekDateRange();
  const entries = await getEntriesForUser(userId, { startDate, endDate });

  const result = categories.map((cat) => {
    const spent = entries
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const status = getCategoryStatus(cat, spent);
    return {
      category: {
        id: cat.id,
        userId: cat.userId,
        name: cat.name,
        monthlyBudget: Number(cat.monthlyBudget),
        colour: cat.colour,
        icon: cat.icon,
        createdAt: cat.createdAt.toISOString(),
      },
      ...status,
    };
  });

  res.json(result);
});

router.post("/", requireAuth, async (req, res) => {
  const { name, monthlyBudget, colour, icon } = req.body;

  if (!name || !monthlyBudget || !colour || !icon) {
    res.status(400).json({ error: "name, monthlyBudget, colour, and icon are required" });
    return;
  }

  const cat = await createCategory({
    userId: req.user!.userId,
    name,
    monthlyBudget: Number(monthlyBudget),
    colour,
    icon,
  });

  res.status(201).json({
    id: cat.id,
    userId: cat.userId,
    name: cat.name,
    monthlyBudget: Number(cat.monthlyBudget),
    colour: cat.colour,
    icon: cat.icon,
    createdAt: cat.createdAt.toISOString(),
  });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const cat = await updateCategory(req.params["id"]!, req.user!.userId, req.body);
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  res.json({
    id: cat.id,
    userId: cat.userId,
    name: cat.name,
    monthlyBudget: Number(cat.monthlyBudget),
    colour: cat.colour,
    icon: cat.icon,
    createdAt: cat.createdAt.toISOString(),
  });
});

router.delete("/:id", requireAuth, async (req, res) => {
  await deleteCategory(req.params["id"]!, req.user!.userId);
  res.json({ success: true, message: "Category deleted" });
});

export default router;
