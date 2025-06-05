import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Task } from '../models/Task';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter: any = { isActive: true };
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Get user's task statistics
    const taskStats = await Task.aggregate([
      {
        $match: { assignedTo: user._id },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const createdTasksCount = await Task.countDocuments({ createdBy: user._id });

    res.json({
      success: true,
      data: {
        user: {
          ...user.toJSON(),
          fullName: user.getFullName(),
        },
        stats: {
          assignedTasks: taskStats,
          createdTasks: createdTasksCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    // Users can only deactivate their own account
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.json({
      success: true,
      message: 'Account deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Verify user exists
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Build filter
    const filter: any = { assignedTo: id };
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(filter)
      .populate('createdBy', 'username email firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.getFullName(),
        },
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};