const WindFarm = require('../models/WindFarm');
const Turbine = require('../models/Turbine');

// Helper: Ensure the wind farm exists and belongs to the manager
const getManagerFarm = async (userId) => {
  return await WindFarm.findOne({ managerId: userId });
};

// GET: All Turbines for Manager's Wind Farm
const getAllTurbines = async (req, res) => {
  try {
    if (req.user.role !== 'windFarmManager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only wind farm managers can access this resource'
      });
    }

    const windFarm = await getManagerFarm(req.user._id);
    if (!windFarm) {
      return res.status(404).json({
        success: false,
        message: 'No wind farm found assigned to this manager'
      });
    }

    const turbines = await Turbine.find({ farmId: windFarm._id })
      .populate('assignedEngineerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: turbines.length,
      farmDetails: {
        farmId: windFarm._id,
        farmName: windFarm.name,
        location: windFarm.location,
        address: windFarm.address,
        district: windFarm.district,
        totalCapacity: windFarm.totalCapacity,
        status: windFarm.status,
        substationName: windFarm.substationName,
        feederCode: windFarm.feederCode,
        createdAt: windFarm.createdAt,
        updatedAt: windFarm.updatedAt
      },
      turbines
    });
  } catch (error) {
    console.error('Error fetching turbines:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// POST: Add a new Turbine manually
const createTurbine = async (req, res) => {
  try {
    if (req.user.role !== 'windFarmManager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only wind farm managers can perform this action'
      });
    }

    const windFarm = await getManagerFarm(req.user._id);
    if (!windFarm) {
      return res.status(404).json({
        success: false,
        message: 'No wind farm assigned to this manager'
      });
    }

    const { turbineCode, model, capacity, status, assignedEngineerId } = req.body;

    // Check for duplicate turbineCode
    const existingTurbine = await Turbine.findOne({ turbineCode });
    if (existingTurbine) {
      return res.status(400).json({
        success: false,
        message: `Turbine with code ${turbineCode} already exists.`
      });
    }

    const newTurbine = await Turbine.create({
      farmId: windFarm._id,
      turbineCode,
      model,
      capacity,
      status: status || 'ACTIVE',
      assignedEngineerId: assignedEngineerId || null
    });

    const populatedTurbine = await newTurbine.populate('assignedEngineerId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Turbine added successfully',
      turbine: populatedTurbine
    });
  } catch (error) {
    console.error('Error creating turbine:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// PUT: Update an existing Turbine
const updateTurbine = async (req, res) => {
  try {
    if (req.user.role !== 'windFarmManager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only wind farm managers can perform this action'
      });
    }

    const { id } = req.params;
    const windFarm = await getManagerFarm(req.user._id);
    if (!windFarm) {
      return res.status(404).json({
        success: false,
        message: 'No wind farm assigned to this manager'
      });
    }

    // Verify the turbine belongs to this manager's wind farm
    const turbine = await Turbine.findOne({ _id: id, farmId: windFarm._id });
    if (!turbine) {
      return res.status(404).json({
        success: false,
        message: 'Turbine not found or does not belong to your assigned wind farm'
      });
    }

    const { turbineCode, model, capacity, status, assignedEngineerId } = req.body;

    if (turbineCode && turbineCode !== turbine.turbineCode) {
      const duplicateCode = await Turbine.findOne({ turbineCode, _id: { $ne: id } });
      if (duplicateCode) {
        return res.status(400).json({
          success: false,
          message: `Turbine code '${turbineCode}' is already taken.`
        });
      }
      turbine.turbineCode = turbineCode;
    }

    if (model !== undefined) turbine.model = model;
    if (capacity !== undefined) turbine.capacity = capacity;
    if (status !== undefined) turbine.status = status;
    if (assignedEngineerId !== undefined) turbine.assignedEngineerId = assignedEngineerId;

    await turbine.save();
    const updatedTurbine = await turbine.populate('assignedEngineerId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Turbine updated successfully',
      turbine: updatedTurbine
    });
  } catch (error) {
    console.error('Error updating turbine:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// DELETE: Delete a Turbine
const deleteTurbine = async (req, res) => {
  try {
    if (req.user.role !== 'windFarmManager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only wind farm managers can perform this action'
      });
    }

    const { id } = req.params;
    const windFarm = await getManagerFarm(req.user._id);
    if (!windFarm) {
      return res.status(404).json({
        success: false,
        message: 'No wind farm assigned to this manager'
      });
    }

    const deletedTurbine = await Turbine.findOneAndDelete({ _id: id, farmId: windFarm._id });
    if (!deletedTurbine) {
      return res.status(404).json({
        success: false,
        message: 'Turbine not found or does not belong to your assigned wind farm'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Turbine deleted successfully',
      turbineId: id
    });
  } catch (error) {
    console.error('Error deleting turbine:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllTurbines,
  createTurbine,
  updateTurbine,
  deleteTurbine
};