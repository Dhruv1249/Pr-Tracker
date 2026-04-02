const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    pullRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PullRequest',
      required: true,
    },
    pullRequestNumber: {
      type: Number,
      required: true,
    },
    user: {
      login: String,
      avatarUrl: String,
      githubId: Number,
    },
    state: {
      type: String,
      enum: ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED', 'DISMISSED', 'PENDING'],
      required: true,
      index: true,
    },
    body: {
      type: String,
      trim: true,
    },
    commitId: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
reviewSchema.index({ pullRequest: 1 });
reviewSchema.index({ 'user.login': 1 });
reviewSchema.index({ pullRequestNumber: 1 });
reviewSchema.index({ state: 1, submittedAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
