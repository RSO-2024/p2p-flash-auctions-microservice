import express from "express";
import createListing from "./createListing";
// import getListings from "./getListings";
// import updateListing from "./updateListing";
// import deleteListing from "./deleteListing";

const router = express.Router();

router.use("/create", createListing);
// router.use("/get", getListings);
// router.use("/update", updateListing);
// router.use("/delete", deleteListing);

export default router;
