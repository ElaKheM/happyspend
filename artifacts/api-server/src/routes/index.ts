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

export default router;
