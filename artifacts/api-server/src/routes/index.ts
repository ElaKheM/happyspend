import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import onboardingRouter from "./onboarding";
import personasRouter from "./personas";
import categoriesRouter from "./categories";
import entriesRouter from "./entries";
import dashboardRouter from "./dashboard";
import summariesRouter from "./summaries";
import milestonesRouter from "./milestones";
import profileRouter from "./profile";
import notificationsRouter from "./notifications";
import correctionsRouter from "./corrections";
import spendDnaRouter from "./spend-dna";
import reallocationsRouter from "./reallocations";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/onboarding", onboardingRouter);
router.use("/personas", personasRouter);
router.use("/categories", categoriesRouter);
router.use("/entries", entriesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/summaries", summariesRouter);
router.use("/milestones", milestonesRouter);
router.use("/profile", profileRouter);
router.use("/notifications", notificationsRouter);
router.use(correctionsRouter);
router.use("/spend-dna", spendDnaRouter);
router.use("/reallocations", reallocationsRouter);

export default router;
