import express from "express";
import createListing from "./createListing";
import getListings from "./getListings";
import updateListing from "./updateListing";
import deleteListing from "./deleteListing";
import { authenticateUser } from "../../middleware/authorization";

const router = express.Router();

router.use("/", createListing);
router.use("/", getListings);
router.use("/", updateListing);
router.use("/", deleteListing);

export default router;
