import mongoose, { Document, Schema } from 'mongoose';

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  assignedTo: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isOverdue(): boolean;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function(this: ITask, value: Date) {
          return !value || value > new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot exceed 30 characters'],
    }],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to a user'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ status: 1, priority: 1 });

// Virtual for checking if task is overdue
taskSchema.methods.isOverdue = function(): boolean {
  if (!this.dueDate || this.status === TaskStatus.COMPLETED) {
    return false;
  }
  return new Date() > this.dueDate;
};

// Middleware to set completedAt when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === TaskStatus.COMPLETED && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== TaskStatus.COMPLETED) {
      this.completedAt = undefined;
    }
  }
  next();
});

// Compound text index for search functionality
taskSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
});

export const Task = mongoose.model<ITask>('Task', taskSchema);