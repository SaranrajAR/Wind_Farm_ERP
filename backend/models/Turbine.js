const mongoose = require("mongoose");
const TurbineSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WindFarm", // References your WindFarm model
      required: true,
      index: true
    },
    turbineCode: {
      type: String,
      required: true,
      unique: true,
      trim: true // e.g., "WTG-MUP-01"
    },
    model: {
      type: String,
      required: true,
      trim: true // e.g., "Suzlon S120", "Gamesa G97", "Vestas V110"
    },
    capacity: {
      type: Number,
      required: true // Rated power capacity in kW (e.g., 2100 for 2.1 MW)
    },
    status: {
      type: String,
      enum: ["ACTIVE", "MAINTENANCE", "FAULT", "OFFLINE"],
      default: "ACTIVE"
    },
    // Optional: Useful for ERP work assignment
    assignedEngineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly fetch all turbines in a specific farm by status
TurbineSchema.index({ farmId: 1, status: 1 });
module.exports = mongoose.model("Turbine", TurbineSchema);