import { Router } from "express";
import sql from "../../database/db";
import { ListingModel } from "../../models/listingmodel";
import { validateOrReject } from "class-validator";
import { BaseModel } from "../../models/basemodel";

const router = Router();

/**
 * @swagger
 * /listings:
 *   patch:
 *     tags:
 *      - Listings
 *     summary: Partially update a listing.
 *     description: Partially updates a `listings` table with the provided query data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user creating the listing.
 *               title:
 *                 type: string
 *                 description: Title of the listing.
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 description: Detailed description of the listing.
 *               user_price:
 *                 type: number
 *                 description: Price set by the user.
 *               is_appraised:
 *                 type: boolean
 *                 description: Indicates if the item is appraised.
 *               is_auction:
 *                 type: boolean
 *                 description: Indicates if the item is being auctioned.
 *               auction_end:
 *                 type: string
 *                 format: date-time
 *                 description: End date and time of the auction.
 *               seo_tag:
 *                 type: string
 *                 description: SEO tag for the listing.
 *               seo_desc:
 *                 type: string
 *                 description: SEO description for the listing.
 *               url:
 *                  type: string
 *                  description: URL of the current listing
 *               firstReg:
 *                  type: date-time
 *                  description: The date and time of first registration of the vehicle
 *               mileage:
 *                  type: number
 *                  description: Mileage on the car (in km)
 *               fuel:
 *                  type: string
 *                  description: Type of fuel
 *               transmission:
 *                  type: string
 *                  description: Type of transmission
 *               kw:
 *                  type: number
 *                  description: Power of the car (in kW)
 *               engineSize:
 *                  type: number
 *                  description: Size of engine (in cc)
 *               vin:
 *                  type: string
 *                  description: Vehicle identification number
 *               ddv:
 *                  type: boolean
 *                  description: DDV included
 *               location:
 *                  type: number
 *                  description: Mileage on the car
 *               possiblePrice:
 *                  type: number
 *                  description: First possible price on the car
 *               deliveryPrice:
 *                  type: number
 *                  description: Price of the delivery
 *               deliveryTime:
 *                  type: datetime
 *                  description: Date and time of the delivery possible
 *     responses:
 *       201:
 *         description: Listing updated successfully.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.patch("/", async (req, res) => {
  try {
    // Map request body to the ListingModel class
    const listingData : ListingModel = Object.assign(new ListingModel(), req.body);
    listingData.prepareQueryData();

    // Validate the data
    await validateOrReject(listingData, {
        skipMissingProperties: true
    });

    // Generate SQL INSERT query dynamically
    const sqlQuery = BaseModel.toUpdateSQL('listings', listingData);

    // Execute the query
    const result = await sql.unsafe(sqlQuery);

    // Return the created record
    res.status(201).json({
      status: "success",
      message: "Listings updated successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    res.status(500).json({
      status: "error",
      message: `Internal server error. ${error}`,
    });
  }
});

export default router;