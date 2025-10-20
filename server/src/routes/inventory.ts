import express from "express";
import { authenticateToken } from "../middleware/auth";
import { pool } from "../config/database";
import { RowDataPacket, OkPacket } from "mysql2";
import upload from "../middleware/multer";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinaryUpload";

const router = express.Router();

// Get all inventory items
router.get("/items", authenticateToken, async (req, res) => {
  try {
    const [rows] = (await pool.execute(`
      SELECT 
        mi.id,
        mi.product_code,
        mi.name,
        mi.description,
        mi.selling_price,
        mi.purchase_price,
        mi.purchase_value,
        mi.quantity_in_stock,
        mi.unit_type,
        mi.availability,
        mi.image_url,
        mi.is_unlimited,
        mi.is_premium,
        mi.created_at,
        mi.updated_at,
        mc.name as category_name,
        mc.id as category_id
      FROM menu_items mi
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      ORDER BY mc.sort_order, mi.name
    `)) as [RowDataPacket[], any];

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory data",
    });
  }
});

// Get inventory categories
router.get("/categories", authenticateToken, async (req, res) => {
  try {
    const [rows] = (await pool.execute(`
      SELECT id, name, description, sort_order
      FROM menu_categories
      WHERE is_active = TRUE
      ORDER BY sort_order
    `)) as [RowDataPacket[], any];

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
});

// Get inventory statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const [totalItems] = (await pool.execute(`
      SELECT COUNT(*) as total FROM menu_items
    `)) as [RowDataPacket[], any];

    // Calculate total sales revenue from completed orders
    const [totalValue] = (await pool.execute(`
      SELECT COALESCE(SUM(total_amount), 0) as total_value 
      FROM orders
      WHERE status = 'completed'
    `)) as [RowDataPacket[], any];

    const [lowStock] = (await pool.execute(`
      SELECT COUNT(*) as low_stock FROM menu_items
      WHERE quantity_in_stock <= 10 AND is_unlimited = FALSE
    `)) as [RowDataPacket[], any];

    const [outOfStock] = (await pool.execute(`
      SELECT COUNT(*) as out_of_stock FROM menu_items
      WHERE quantity_in_stock = 0 AND is_unlimited = FALSE
    `)) as [RowDataPacket[], any];

    res.json({
      success: true,
      data: {
        total_items: totalItems[0].total,
        total_value: totalValue[0].total_value || 0,
        low_stock: lowStock[0].low_stock,
        out_of_stock: outOfStock[0].out_of_stock,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
    });
  }
});

// Add new inventory item
router.post(
  "/items",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        product_code,
        name,
        description,
        category_id,
        selling_price,
        purchase_price,
        quantity_in_stock,
        unit_type,
        availability,
        is_unlimited,
        is_premium,
      } = req.body;

      const parsedIsUnlimited =
        is_unlimited === "true" || is_unlimited === true ? 1 : 0;
      const parsedIsPremium =
        is_premium === "true" || is_premium === true ? 1 : 0;

      // Validate required fields (product_code optional - will be generated if not provided)
      if (!name || !category_id || selling_price === undefined || selling_price === null) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: name, category_id, and selling_price are required",
        });
      }

      // Generate unique product code if not provided
      let finalProductCode: string = (product_code && String(product_code).trim()) || "";
      if (!finalProductCode) {
        const genCode = async (): Promise<string> => {
          const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid ambiguous chars
          const rand = () => Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
          return `SKU-${rand()}`;
        };

        let attempts = 0;
        while (attempts < 5) {
          attempts++;
          const code = await genCode();
          const [existing] = (await pool.execute(
            `SELECT id FROM menu_items WHERE product_code = ? LIMIT 1`,
            [code]
          )) as [RowDataPacket[], any];
          if (!existing || existing.length === 0) {
            finalProductCode = code;
            break;
          }
        }
        if (!finalProductCode) {
          // fallback using timestamp
          finalProductCode = `SKU-${Date.now()}`;
        }
      }

      let image_url = null;
      let image_public_id = null;

      // upload image to Cloudinary if provided
      if (req.file) {
        try {
          const uploadResult = await uploadToCloudinary(req.file.buffer);
          image_url = uploadResult.secure_url;
          image_public_id = uploadResult.public_id;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
          });
        }
      }

      // Sanitize numeric values
      const sanitizedQuantity =
        quantity_in_stock === null ||
        quantity_in_stock === undefined ||
        quantity_in_stock === ""
          ? 0
          : parseInt(quantity_in_stock);
      const sanitizedPurchasePrice =
        purchase_price === null ||
        purchase_price === undefined ||
        purchase_price === ""
          ? null
          : parseFloat(purchase_price);
      const sanitizedPurchaseValue =
        sanitizedPurchasePrice && sanitizedQuantity
          ? sanitizedPurchasePrice * sanitizedQuantity
          : 0;

          const [result] = (await pool.execute(
            `
          INSERT INTO menu_items (
            product_code, name, description, category_id, selling_price,
            purchase_price, purchase_value, quantity_in_stock, unit_type,
            availability, image_url, image_public_id, is_unlimited, is_premium
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          finalProductCode,
          name,
          description || null,
          parseInt(category_id),
          parseFloat(selling_price),
          sanitizedPurchasePrice,
          sanitizedPurchaseValue,
          sanitizedQuantity,
          unit_type || "piece",
          availability || "available",
          image_url,
          image_public_id,
          parsedIsUnlimited,
          parsedIsPremium,
        ]
      )) as [OkPacket, any];

      res.json({
        success: true,
        message: "Inventory item added successfully",
        data: { id: result.insertId },
      });
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add inventory item",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Update inventory item
router.put(
  "/items/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product_code,
        name,
        description,
        category_id,
        selling_price,
        purchase_price,
        purchase_value,
        quantity_in_stock,
        unit_type,
        availability,
        is_unlimited,
        is_premium,
      } = req.body;

      const parsedIsUnlimited =
        is_unlimited === "true" || is_unlimited === true ? 1 : 0;
      const parsedIsPremium =
        is_premium === "true" || is_premium === true ? 1 : 0;

      // get current item to check for existing image and to preserve non-updated fields
      const [currentItems] = (await pool.execute(
        `
      SELECT 
        product_code, name as current_name, description as current_description, category_id as current_category_id,
        selling_price as current_selling_price, purchase_price as current_purchase_price, purchase_value as current_purchase_value,
        quantity_in_stock as current_quantity_in_stock, unit_type as current_unit_type, availability as current_availability,
        is_unlimited as current_is_unlimited, is_premium as current_is_premium, image_public_id
      FROM menu_items WHERE id = ?
    `,
        [id]
      )) as [RowDataPacket[], any];

      if (currentItems.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Inventory item not found",
        });
      }

  const currentItem = currentItems[0];
      let image_url = null;
      let image_public_id = currentItem.image_public_id;

      // ff new image is uploaded
      if (req.file) {
        // delete old image if exists
        if (currentItem.image_public_id) {
          try {
            await deleteFromCloudinary(currentItem.image_public_id);
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        // upload new image
        try {
          const uploadResult = await uploadToCloudinary(req.file.buffer);
          image_url = uploadResult.secure_url;
          image_public_id = uploadResult.public_id;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({
            success: false,
            message: "Failed to upload image",
          });
        }
      }

      // Prepare updated values; preserve current values when body field is undefined
      const updatedProductCode =
        product_code !== undefined && product_code !== ""
          ? String(product_code)
          : String(currentItem.product_code);
      const updatedName = name !== undefined ? name : String(currentItem.current_name);
      const updatedDescription = description !== undefined ? (description || null) : (currentItem.current_description || null);
      const updatedCategoryId =
        category_id !== undefined && category_id !== ""
          ? parseInt(category_id)
          : (currentItem.current_category_id !== null ? Number(currentItem.current_category_id) : null);
      const updatedSellingPrice =
        selling_price !== undefined && selling_price !== ""
          ? parseFloat(selling_price)
          : Number(currentItem.current_selling_price);
      const updatedPurchasePrice =
        purchase_price !== undefined
          ? (purchase_price === "" ? null : parseFloat(purchase_price))
          : (currentItem.current_purchase_price !== null ? Number(currentItem.current_purchase_price) : null);
      const updatedQuantity =
        quantity_in_stock !== undefined && quantity_in_stock !== ""
          ? parseInt(quantity_in_stock)
          : Number(currentItem.current_quantity_in_stock);
      const updatedUnitType = unit_type !== undefined ? unit_type : String(currentItem.current_unit_type);
      const updatedAvailability = availability !== undefined && availability !== ""
        ? availability
        : String(currentItem.current_availability);
      const updatedPurchaseValue =
        purchase_value !== undefined && purchase_value !== ""
          ? parseFloat(purchase_value)
          : (currentItem.current_purchase_value !== null ? Number(currentItem.current_purchase_value) : 0);

      let updateQuery = `
      UPDATE menu_items SET
        product_code = ?, name = ?, description = ?, category_id = ?,
        selling_price = ?, purchase_price = ?, purchase_value = ?,
        quantity_in_stock = ?, unit_type = ?, availability = ?,
        is_unlimited = ?, is_premium = ?, updated_at = CURRENT_TIMESTAMP
    `;

      const queryParams = [
        updatedProductCode,
        updatedName,
        updatedDescription,
        updatedCategoryId,
        updatedSellingPrice,
        updatedPurchasePrice,
        updatedPurchaseValue,
        updatedQuantity,
        updatedUnitType,
        updatedAvailability,
        parsedIsUnlimited,
        parsedIsPremium,
      ];

      // if image was uploaded include image fields in update
      if (req.file) {
        updateQuery += `, image_url = ?, image_public_id = ?`;
        queryParams.push(image_url, image_public_id);
      }

      updateQuery += ` WHERE id = ?`;
      queryParams.push(parseInt(id));

      await pool.execute(updateQuery, queryParams);

      res.json({
        success: true,
        message: "Inventory item updated successfully",
      });
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update inventory item",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

// Delete inventory item
router.delete("/items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // get item to check for image
    const [currentItems] = await pool.execute<RowDataPacket[]>(
      `
      SELECT image_public_id FROM menu_items WHERE id = ?
    `,
      [id]
    );

    if (currentItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const currentItem = currentItems[0];
    // delete image if exists
    if (currentItem.image_public_id) {
      try {
        await deleteFromCloudinary(currentItem.image_public_id);
      } catch (deleteError) {
        console.error("Error deleting image from Cloudinary:", deleteError);
      }
    }

    await pool.execute("DELETE FROM menu_items WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
});

export default router;
