import mongoose from 'mongoose';

const threadSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  imageCaption: {
    type: String,
    default: null,
    trim: true,
    maxlength: 200
  },
  author: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    avatarUrl: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['approved', 'flagged'],
    default: 'approved'
  },
  summary: {
    type: String,
    default: null
  },
  moderation: {
    status: {
      type: String,
      enum: ['Safe', 'Flagged', 'Skipped'],
      default: 'Safe'
    },
    reason: String,
    confidence: Number,
    reviewedByAdmin: {
      type: Boolean,
      default: false
    }
  },
  replyCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
threadSchema.index({ topic: 1, createdAt: -1 });
threadSchema.index({ status: 1 });
threadSchema.index({ 'author._id': 1 });
threadSchema.index({ 
  title: 'text', 
  content: 'text' 
});

// Virtual for like count
threadSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for likedByMe (will be set by controller)
threadSchema.virtual('likedByMe').get(function() {
  return false; // Will be set by controller based on current user
});

// Ensure virtuals are serialized
threadSchema.set('toJSON', { virtuals: true });
threadSchema.set('toObject', { virtuals: true });

// Update reply count when replies are added/removed
threadSchema.methods.updateReplyCount = async function() {
  const Reply = mongoose.model('Reply');
  this.replyCount = await Reply.countDocuments({ threadId: this._id });
  return this.save();
};

// Static method to update reply count
threadSchema.statics.updateReplyCount = async function(threadId) {
  const Reply = mongoose.model('Reply');
  const replyCount = await Reply.countDocuments({ threadId });
  return this.findByIdAndUpdate(threadId, { replyCount }, { new: true });
};

export default mongoose.model('Thread', threadSchema);
