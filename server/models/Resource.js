 const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    // Resource name
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Details about the resource
    description: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
        type: String,
        required: true,
        unique : true,
        trim: true,
        lowercase: true,
    },

    phone: {
        type: String,
        required: false,
        trim: true,
    },

    // Example: Books, Notes, Lab File, Equipment
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Selling price
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // User who is selling this resource
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Optional lab file number
    labFileNo: {
      type: String,
      required: false,
      trim: true,
    },

    // Resource location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for nearby resources
resourceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Resource", resourceSchema);