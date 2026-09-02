const mongoose = require('mongoose');
const WindFarmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true // e.g., "Muppandal Wind Farm"
    },
    // GeoJSON Point for Maps & Spatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true // e.g., "Aralvaimozhi Pass, Thovalai, Pincode 629301"
    },
    district: {
      type: String,
      required: true,
      enum: [
        "Kanyakumari",
        "Tirunelveli",
        "Coimbatore",
        "Tiruppur",
        "Dindigul",
        "Theni",
        "Tuticorin",
        "Other"
      ]
    },
    totalCapacity: {
      type: Number,
      required: true // Capacity in MW (e.g., 45.5)
    },
    status: {
      type: String,
      enum: ["ACTIVE", "MAINTENANCE", "OFFLINE"],
      default: "ACTIVE"
    },

    // Optional: Simple TNEB Grid Connection Details
    substationName: {
      type: String,
      default: "Muppandal 110kV SS"
    },
    feederCode: {
      type: String,
      default: "FDR-33KV-01"
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Index for map queries
WindFarmSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("WindFarm", WindFarmSchema);