import { Router } from "express";
import { P2PAuctionModel } from "../../models/p2pAuctionModel";
import { authenticateUser } from "../../middleware/authorization";
import { configManager } from "../../config/configmanager";
import { logErrorToSentry } from "../../sentry/instrument";

const router = Router();

/**
 * @swagger
 * /data:
 *   post:
 *     tags:
 *      - Flash Auctions
 *     summary: Create a new flash auction from given listing id.
 *     description: Adds a new entry to the `auctions` table with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listing_id:
 *                 type: int
 *                 description: ID of the listing to be moved to the auction.
 *               start_time:
 *                 type: string
 *                 description: ISO Date string of the start time. Should be before the end date and scheduled in the future.
 *               end_time:
 *                 type: string
 *                 description: ISO Date string of the end time. Should be after the start date and scheduled in the future.
 *     responses:
 *       201:
 *         description: Auction created successfully.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", authenticateUser, async (req, res) => {
  try {

    const auctionData : P2PAuctionModel = Object.assign(new P2PAuctionModel(), req.body);

    const { data, error } = await auctionData.createFlashAuction(req.headers.authorization!);

    if (error) {

      let errorMessage = `Unexpected error occurred. Code: ${error.code}. ${error.message}`
      
      // Log to Sentry
      if (configManager.getConfig().NODE_ENV === "prod") {
        logErrorToSentry(errorMessage, req);
      }

      res.status(400).json({
          status: "error",
          message: errorMessage,
      });
      return
    }

    // Create the flash auction from the listing id

    // Return the created record
    res.status(201).json({
      status: "success",
      message: "Auction created successfully."
    });
  } catch (error) {
    console.error("Error creating auction:", error);
    // Log to Sentry
    if (configManager.getConfig().NODE_ENV === "prod") {
      logErrorToSentry(`${error}`, req)
    }
    res.status(500).json({
      status: "error",
      message: `Internal server error. ${error}`,
    });
  }
});

export default router;