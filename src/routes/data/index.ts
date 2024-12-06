import express from "express";
import createListing from "./createListing";
import getListings from "./getListings";
import updateListing from "./updateListing";
import deleteListing from "./deleteListing";

const router = express.Router();

router.use("/", createListing);
router.use("/", getListings);
router.use("/", updateListing);
router.use("/", deleteListing);

export default router;
