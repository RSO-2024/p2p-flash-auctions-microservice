import { Router } from "express";
import sql from "../../database/db";

const router = Router();

/**
 * @swagger
 * /listings/create:
 *   post:
 *     tags:
 *      - Listings
 *     summary: Create a new listing
 *     description: Adds a new entry to the `listings` table with the provided data.
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
 *     responses:
 *       201:
 *         description: Listing created successfully.
 *       400:
 *         description: Invalid request data.
 *       500:
 *         description: Internal server error.
 */
router.post("/", async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      user_price,
      is_appraised,
      is_auction = false,
      auction_end,
      seo_tag,
      seo_desc,
    } = req.body;

    // Validate required fields
    if (!user_id || !title || !user_price) {
      res.status(400).json({
        status: "error",
        message: "user_id, title, and user_price are required fields.",
      });
      return
    }

    // Insert data into the database
    const result = await sql`
      INSERT INTO listings (
        user_id,
        title,
        description,
        user_price,
        is_appraised,
        is_auction,
        auction_end,
        seo_tag,
        seo_desc
      ) VALUES (
        ${user_id},
        ${title},
        ${description || null},
        ${user_price},
        ${is_appraised || null},
        ${is_auction},
        ${auction_end || null},
        ${seo_tag || null},
        ${seo_desc || null}
      ) RETURNING *;
    `;

    // Return the created record
    res.status(201).json({
      status: "success",
      message: "Listing created successfully.",
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error.",
    });
  }
});

export default router;