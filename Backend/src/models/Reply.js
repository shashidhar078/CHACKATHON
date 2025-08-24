import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
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
  emojiReactions: {
    type: Map,
    of: Number,
    default: {}
  },
  replyCount: {
    type: Number,
    default: 0
  },
  depth: {
    type: Number,
    default: 0
  },
  parentReplyAuthor: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
replySchema.index({ threadId: 1, createdAt: -1 });
replySchema.index({ parentReplyId: 1, createdAt: -1 });
replySchema.index({ 'author._id': 1 });
replySchema.index({ status: 1 });

// Virtual for like count
replySchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for likedByMe (will be set by controller)
replySchema.virtual('likedByMe').get(function() {
  return false; // Will be set by controller based on current user
});

// Ensure virtuals are serialized
replySchema.set('toJSON', { virtuals: true });
replySchema.set('toObject', { virtuals: true });

// Update thread reply count when reply is saved/deleted
replySchema.post('save', async function() {
  const Thread = mongoose.model('Thread');
  await Thread.findByIdAndUpdate(this.threadId, { $inc: { replyCount: 1 } });
});

replySchema.post('remove', async function() {
  const Thread = mongoose.model('Thread');
  await Thread.findByIdAndUpdate(this.threadId, { $inc: { replyCount: -1 } });
});

export default mongoose.model('Reply', replySchema);
