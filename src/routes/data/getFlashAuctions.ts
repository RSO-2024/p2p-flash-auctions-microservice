import { Router } from "express";
import { validateOrReject } from "class-validator";
import { P2PAuctionModel } from "../../models/p2pAuctionModel";

const router = Router();

/**
 * @swagger
 * /flash-auctions/data:
 *   get:
 *     tags:
 *      - Flash Auctions
 *     summary: Gets auctions based on provided queries. 
 *     description: Returns flash auctions with the results.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                type: object
 *                description: Query the API with these queryable fields
 *                properties:
 *                 auction_id:
 *                   type: number
 *                   description: Search by the id of the auction
 *                 is_flash:
 *                   type: boolean
 *                   description: Search by flash auctions
 *                 has_ended:
 *                   type: boolean
 *                   description: Search by inactive flash auctions
 *     responses:
 *       200:
 *         description: Returned auctions.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.get("/", async (req, res) => {
  try {
    // Map request body to the ListingModel class
    const auctionData : P2PAuctionModel = new P2PAuctionModel();

    // Prepare queryable data
    auctionData.prepareQueryData(req.body.query);

    const { data, error } = await auctionData.getAuctions();

    if (error) {
      res.status(400).json({
          status: "error",
          message: `Unexpected error occurred. Code: ${error.code}. ${error.message}`,
      });
      return
    }

    // Loop through each result and validate
    const validatedResults = [];
    
    for (const resultData of data) {
      const validatedResult : P2PAuctionModel = Object.assign(new P2PAuctionModel(), resultData);
      validatedResult.parseData();

      await validateOrReject(validatedResult);
      validatedResults.push(validatedResult);
    }

    // Return the created record
    res.status(200).json({
      status: "success",
      message: "Read success.",
      data: validatedResults,
    });
  } catch (error) {
    console.error("Error collecting auctions:", error);
    res.status(500).json({
      status: "error",
      message: `Internal server error. ${error}`,
    });
  }
});

export default router;