import { Router } from "express";
import sql from "../../database/db";
import { ListingModel } from "../../models/listingmodel";
import { validateOrReject } from "class-validator";
import { BaseModel } from "../../models/basemodel";
import { getTableName } from "../../database/config_db";
import { authenticateUser } from "../../middleware/authorization";
import { PostgrestSingleResponse } from "@supabase/supabase-js";

const router = Router();

/**
 * @swagger
 * /listings/data:
 *   delete:
 *     tags:
 *      - Listings
 *     summary: Deletes a listing based on provided queries. 
 *     description: Returns data with the results.
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
 *                 user_id:
 *                   type: string
 *                   description: UUID of the user listing.
 *                 listing_id:
 *                   type: number
 *                   description: ID of the existing listing to delete.
 *     responses:
 *       201:
 *         description: Returned listings.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.delete("/", authenticateUser, async (req, res) => {
  try {
    // Map request body to the ListingModel class
    const listingData : ListingModel = new ListingModel();
    listingData.prepareQueryData(req.body.query);

    const response = await listingData.deleteListing(req.body.user, req.headers.authorization!);

    if (response.error) {
      res.status(400).json({
          status: "error",
          message: `Unexpected error occurred. Code: ${response.error.code}. ${response.error.message}`,
      });
      return
    }

    // Return the created record
    res.status(200).json({
      status: "success",
      message: "Delete success."
    });
  } catch (error) {
    console.error("Error deleting listings:", error);
    res.status(500).json({
      status: "error",
      message: `Internal server error. ${error}`,
    });
  }
});

export default router;