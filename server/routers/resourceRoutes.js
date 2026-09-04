 const express = require("express");
const Resource = require("../models/Resource");

const router = express.Router();

// =====================================================
// ADD NEW RESOURCE
// POST /api/resources
// =====================================================

router.post("/", async (req, res) => {
  try {
    console.log("Creating resource:");
    console.log(req.body);

    const resource = new Resource({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      price: Number(req.body.price),
      seller: req.body.seller,
      location: req.body.location,
    });

    const savedResource = await resource.save();

    // Populate seller information
    const populatedResource =
      await Resource.findById(savedResource._id)
        .populate("seller", "name email phone");

    console.log("Resource created successfully");

    res.status(201).json(populatedResource);

  } catch (error) {
    console.error("Create resource error:", error);

    res.status(500).json({
      message: "Failed to create resource",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL RESOURCES
// GET /api/resources
// =====================================================

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    console.log(
      "Resources fetched:",
      resources.length
    );

    res.status(200).json(resources);

  } catch (error) {
    console.error("Fetch resources error:", error);

    res.status(500).json({
      message: "Failed to fetch resources",
      error: error.message,
    });
  }
});

// =====================================================
// FIND NEARBY RESOURCES
// GET /api/resources/nearby
// =====================================================

router.get("/nearby", async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      distance = 5000,
    } = req.query;

    // -------------------------------------------------
    // CHECK COORDINATES
    // -------------------------------------------------

    if (
      longitude === undefined ||
      latitude === undefined
    ) {
      return res.status(400).json({
        message:
          "Longitude and latitude are required",
      });
    }

    // -------------------------------------------------
    // CONVERT VALUES TO NUMBERS
    // -------------------------------------------------

    const lng = Number(longitude);
    const lat = Number(latitude);
    const maxDistance = Number(distance);

    // -------------------------------------------------
    // VALIDATE NUMBERS
    // -------------------------------------------------

    if (
      Number.isNaN(lng) ||
      Number.isNaN(lat) ||
      Number.isNaN(maxDistance)
    ) {
      return res.status(400).json({
        message:
          "Longitude, latitude and distance must be valid numbers",
      });
    }

    // -------------------------------------------------
    // VALIDATE COORDINATE RANGE
    // -------------------------------------------------

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        message: "Longitude must be between -180 and 180",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        message: "Latitude must be between -90 and 90",
      });
    }

    if (maxDistance <= 0) {
      return res.status(400).json({
        message: "Distance must be greater than 0",
      });
    }

    // -------------------------------------------------
    // FIND NEARBY RESOURCES
    // -------------------------------------------------

    const resources = await Resource.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              lng,
              lat,
            ],
          },
          $maxDistance: maxDistance,
        },
      },
    }).populate("seller", "name email phone");

    // -------------------------------------------------
    // LOG RESULT
    // -------------------------------------------------

    console.log(
      "Nearby resources found:",
      resources.length
    );

    // -------------------------------------------------
    // SEND ONE RESPONSE ONLY
    // -------------------------------------------------

    return res.status(200).json(resources);

  } catch (error) {
    console.error(
      "Nearby resources error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to find nearby resources",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;