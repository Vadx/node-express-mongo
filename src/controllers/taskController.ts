import { Response, NextFunction } from 'express';
import { Task, TaskStatus, TaskPriority } from '../models/Task';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { title, description, priority, dueDate, tags, assignedTo } = req.body;

    // If assignedTo is not provided, assign to the current user
    const assigneeId = assignedTo || req.user._id;

    // Verify assignee exists
    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      return next(new AppError('Assigned user not found', 404));
    }

    const task = new Task({
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      dueDate,
      tags: tags || [],
      assignedTo: assigneeId,
      createdBy: req.user._id,
    });

    await task.save();
    await task.populate(['assignedTo', 'createdBy'], 'username email firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const {
      status,
      priority,
      assignedTo,
      createdBy,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter: any = {};

    // Users can see tasks assigned to them or created by them
    filter.$or = [
      { assignedTo: req.user._id },
      { createdBy: req.user._id },
    ];

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    // Calculate pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'username email firstName lastName')
      .populate('createdBy', 'username email firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
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

export const getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { id } = req.params;

    const task = await Task.findOne({
      _id: id,
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ],
    })
      .populate('assignedTo', 'username email firstName lastName')
      .populate('createdBy', 'username email firstName lastName');

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { id } = req.params;
    const updates = req.body;

    // Find task and check permissions
    const task = await Task.findOne({
      _id: id,
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id },
      ],
    });

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'username email firstName lastName')
      .populate('createdBy', 'username email firstName lastName');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const { id } = req.params;

    // Find task and check if user is the creator
    const task = await Task.findOne({
      _id: id,
      createdBy: req.user._id,
    });

    if (!task) {
      return next(new AppError('Task not found or you are not authorized to delete it', 404));
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('User not found', 404));
    }

    const userId = req.user._id;

    // Get stats for tasks assigned to user
    const stats = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get priority distribution
    const priorityStats = await Task.aggregate([
      {
        $match: {
          $or: [
            { assignedTo: userId },
            { createdBy: userId },
          ],
        },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get overdue tasks count
    const overdueTasks = await Task.countDocuments({
      $or: [
        { assignedTo: userId },
        { createdBy: userId },
      ],
      dueDate: { $lt: new Date() },
      status: { $ne: TaskStatus.COMPLETED },
    });

    // Format stats
    const statusStats = Object.values(TaskStatus).map(status => ({
      status,
      count: stats.find(s => s._id === status)?.count || 0,
    }));

    const priorityDistribution = Object.values(TaskPriority).map(priority => ({
      priority,
      count: priorityStats.find(s => s._id === priority)?.count || 0,
    }));

    res.json({
      success: true,
      data: {
        statusStats,
        priorityDistribution,
        overdueTasks,
        totalTasks: stats.reduce((sum, stat) => sum + stat.count, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};