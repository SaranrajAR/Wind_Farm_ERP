const mongoose = require("mongoose");

// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI ;


// Inline Turbine Schema & Model definition
const TurbineSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WindFarm",
      required: true,
      index: true
    },
    turbineCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true // Rated power in kW
    },
    status: {
      type: String,
      enum: ["ACTIVE", "MAINTENANCE", "FAULT", "OFFLINE"],
      default: "ACTIVE"
    },
    assignedEngineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  { timestamps: true }
);

const Turbine = mongoose.model("Turbine", TurbineSchema);

// Target WindFarm ID
const farmId = new mongoose.Types.ObjectId("6a946490a37dea699d99894b");

// Sample Turbines dataset
const sampleTurbines = [
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-01",
    model: "Suzlon S120 - 2.1MW",
    capacity: 2100,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-02",
    model: "Suzlon S120 - 2.1MW",
    capacity: 2100,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-03",
    model: "Gamesa G97 - 2.0MW",
    capacity: 2000,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-04",
    model: "Gamesa G97 - 2.0MW",
    capacity: 2000,
    status: "MAINTENANCE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-05",
    model: "Vestas V110 - 2.2MW",
    capacity: 2200,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-06",
    model: "Vestas V110 - 2.2MW",
    capacity: 2200,
    status: "FAULT"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-07",
    model: "Suzlon S111 - 2.1MW",
    capacity: 2100,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-08",
    model: "Suzlon S111 - 2.1MW",
    capacity: 2100,
    status: "OFFLINE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-09",
    model: "Siemens SWT-2.3MW",
    capacity: 2300,
    status: "ACTIVE"
  },
  {
    farmId: farmId,
    turbineCode: "WTG-MUP-10",
    model: "Siemens SWT-2.3MW",
    capacity: 2300,
    status: "ACTIVE"
  }
];

async function seedTurbines() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully.");

    // Clear existing turbines for this farm (optional, prevents duplicate key error)
    await Turbine.deleteMany({ farmId: farmId });
    console.log(`Cleared previous turbines for farmId: ${farmId}`);

    // Insert new sample records
    const inserted = await Turbine.insertMany(sampleTurbines);
    console.log(`Successfully seeded ${inserted.length} turbines.`);
    console.log(inserted);
  } catch (error) {
    console.error("Error while seeding turbines:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedTurbines();