import { Router } from "express";
import sql from "../../database/db";
import { ListingModel } from "../../models/listingmodel";
import { validateOrReject } from "class-validator";
import { BaseModel } from "../../models/basemodel";
import { getTableName } from "../../database/config_db";

const router = Router();

/**
 * @swagger
 * /listings:
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
router.delete("/", async (req, res) => {
  try {
    // Map request body to the ListingModel class
    const listingData : ListingModel = Object.assign(new ListingModel(), req.body);
    listingData.prepareQueryData(req.body.query);

    // Validate the data
    await validateOrReject(listingData, {
        skipMissingProperties: true
    });

    // Generate SQL READ query dynamically
    const sqlQuery = BaseModel.toDeleteSQL(getTableName("p2pListingsTable"), listingData);
    
    // Execute the query
    const results = await sql.unsafe(sqlQuery);

    // Loop through each result and validate
    const validatedResults = [];
    
    for (const resultData of results) {
      const validatedResult : ListingModel = Object.assign(new ListingModel(), resultData);
      validatedResult.parseData();

      await validateOrReject(validatedResult);
      validatedResults.push(validatedResult);
    }

    // Return the created record
    res.status(201).json({
      status: "success",
      message: "Delete success.",
      data: results,
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