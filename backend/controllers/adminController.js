const mongoose = require('mongoose');
const WindFarm = require('../models/WindFarm');
const User = require('../models/User');

// 1. Get all non-admin users (with their current assigned farm populated)
exports.getEligibleUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'tnebAdmin' } })
      .select('-password')
      .populate('windFarmId', 'name district')
      .lean();

    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Create WindFarm and assign staff
exports.createWindFarm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      name,
      longitude,
      latitude,
      address,
      district,
      totalCapacity,
      status,
      substationName,
      feederCode,
      managerId,
      engineerIds = []
    } = req.body;

    // Validate GeoJSON format [longitude, latitude]
    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Coordinates (longitude & latitude) are required' });
    }

    const newFarm = new WindFarm({
      name,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      },
      address,
      district,
      totalCapacity: Number(totalCapacity),
      status: status || 'ACTIVE',
      substationName,
      feederCode
    });

    const savedFarm = await newFarm.save({ session });

    // Assign Manager (Single assignment)
    if (managerId) {
      const manager = await User.findOne({ _id: managerId, role: 'windFarmManager' }).session(session);
      if (!manager) {
        throw new Error('Assigned user is not a valid windFarmManager');
      }
      manager.windFarmId = savedFarm._id;
      await manager.save({ session });
    }

    // Assign Engineers (Multiple assignment)
    if (engineerIds && engineerIds.length > 0) {
      await User.updateMany(
        { _id: { $in: engineerIds }, role: 'Engineer' },
        { $set: { windFarmId: savedFarm._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, message: 'Wind Farm created successfully', data: savedFarm });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get all WindFarms with assigned Manager and Engineers
exports.getAllFarmsWithStaff = async (req, res) => {
  try {
    const farms = await WindFarm.aggregate([
      // Lookup Manager
      {
        $lookup: {
          from: 'users',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$windFarmId', '$$farmId'] },
                    { $eq: ['$role', 'windFarmManager'] }
                  ]
                }
              }
            },
            { $project: { password: 0 } }
          ],
          as: 'manager'
        }
      },
      // Extract single manager object (or null)
      {
        $addFields: {
          manager: { $arrayElemAt: ['$manager', 0] }
        }
      },
      // Lookup Engineers
      {
        $lookup: {
          from: 'users',
          let: { farmId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$windFarmId', '$$farmId'] },
                    { $eq: ['$role', 'Engineer'] }
                  ]
                }
              }
            },
            { $project: { password: 0 } }
          ],
          as: 'engineers'
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json({ success: true, count: farms.length, data: farms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update WindFarm and synchronize staff
exports.updateWindFarm = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const {
      name,
      longitude,
      latitude,
      address,
      district,
      totalCapacity,
      status,
      substationName,
      feederCode,
      managerId, // ID of manager or null/empty
      engineerIds = [] // Array of Engineer IDs
    } = req.body;

    const farm = await WindFarm.findById(id).session(session);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Wind Farm not found' });
    }

    // Update Farm Fields
    if (name) farm.name = name;
    if (address) farm.address = address;
    if (district) farm.district = district;
    if (totalCapacity !== undefined) farm.totalCapacity = Number(totalCapacity);
    if (status) farm.status = status;
    if (substationName) farm.substationName = substationName;
    if (feederCode) farm.feederCode = feederCode;
    if (longitude !== undefined && latitude !== undefined) {
      farm.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
      };
    }

    await farm.save({ session });

    // Synchronize Manager
    // A. Unassign previous manager for this farm
    await User.updateMany(
      { windFarmId: farm._id, role: 'windFarmManager', _id: { $ne: managerId } },
      { $set: { windFarmId: null } },
      { session }
    );
    // B. Assign new manager if specified
    if (managerId) {
      await User.findByIdAndUpdate(
        managerId,
        { $set: { windFarmId: farm._id } },
        { session }
      );
    }

    // Synchronize Engineers
    // A. Unassign engineers that were removed from the farm
    await User.updateMany(
      { windFarmId: farm._id, role: 'Engineer', _id: { $nin: engineerIds } },
      { $set: { windFarmId: null } },
      { session }
    );
    // B. Assign newly selected engineers
    if (engineerIds.length > 0) {
      await User.updateMany(
        { _id: { $in: engineerIds }, role: 'Engineer' },
        { $set: { windFarmId: farm._id } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: 'Wind Farm updated successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: error.message });
  }
};