import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import locationsRouter from "./locations";
import inventoryRouter from "./inventory";
import fulfillmentRouter from "./fulfillment";
import ordersRouter from "./orders";
import alertsRouter from "./alerts";
import analyticsRouter from "./analytics";
import aiRouter from "./ai";
import usersRouter from "./users";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(productsRouter);
router.use(locationsRouter);
router.use(inventoryRouter);
router.use(fulfillmentRouter);
router.use(ordersRouter);
router.use(alertsRouter);
router.use(analyticsRouter);
router.use(aiRouter);

export default router;
