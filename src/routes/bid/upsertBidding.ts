import { Router } from "express";
import { authenticateUser } from "../../middleware/authorization";
import { P2PBidModel } from "../../models/p2pBidModel";
import { validateOrReject } from "class-validator";

const router = Router();

/**
 * @swagger
 * /bid:
 *   post:
 *     tags:
 *      - Bidding
 *     summary: Creates or updates a bid on an auction.
 *     description: Creates or updates a bid on an auction. The bid amount will be deducted from the user's credits and it will be returned in case the user does not win on the auction. If the user wins, the credits are not returned, instead the listing of the auction gets assigned to the user and set to inactive.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               auction_id:
 *                 type: string
 *                 description: UUID of the auction being bid on.
 *               bid_amount:
 *                 type: number
 *                 description: Positive number of credits for the bidding.
 *     responses:
 *       200:
 *         description: Bid updated/created successfully.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", authenticateUser, async (req, res) => {
  try {
    const biddingData : P2PBidModel = Object.assign(new P2PBidModel(), req.body);

    await validateOrReject(biddingData); 

    var current_bid_amount = biddingData.bid_amount;

    const responseCredits = await biddingData.getUserCredits(req.body.user);

    // Check error and user credits
    if (responseCredits.error) {
      res.status(400).json({
        status: "error",
        message: `Unexpected error occurred. Code: ${responseCredits.error.code}. ${responseCredits.error.message}`,
      });
      return
    } else if (responseCredits.data.credits && responseCredits.data.credits < biddingData.bid_amount) {
      res.status(400).json({
        status: "error",
        message: `User does not have enough credits to bid.`,
      });
      return
    }

    // This should probably happen in transaction
    const responseBid = await biddingData.placeBid(req.headers.authorization!, responseCredits.data);

    if (responseBid.error) {
      res.status(400).json({
          status: "error",
          message: `Could not place the bid. Code: ${responseBid.error.code}. ${responseBid.error.message}`,
      });
      return
    }

    const responseUpdatedCredits = await biddingData.updateUserCredits(req.headers.authorization!, responseCredits.data, current_bid_amount);

    if (responseUpdatedCredits.error) {
      // If this goes wrong, we should probably revoke the bid as well. 
      res.status(400).json({
        status: "error",
        message: `Could not update the user's credits. Code: ${responseUpdatedCredits.error.code}. ${responseUpdatedCredits.error.message}`,
      });
      return
    }

    // Return the created record
    res.status(200).json({
      status: "success",
      message: "Bid placed successfully.",
      dataBid: responseBid.data,
      dataCredits: responseUpdatedCredits.data
    });
  } catch (error) {
    console.error("Error placing the bid:", error);
    res.status(500).json({
      status: "error",
      message: `Internal server error. ${error}`,
    });
  }
});

export default router;