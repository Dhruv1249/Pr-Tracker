const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    number: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      enum: ['open', 'closed', 'merged', 'draft'],
      default: 'open',
      index: true,
    },
    author: {
      login: String,
      avatarUrl: String,
      githubId: Number,
    },
    repository: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    repositoryFullName: {
      type: String,
      required: true,
    },
    baseBranch: {
      type: String,
      required: true,
    },
    headBranch: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      trim: true,
    },
    labels: [{
      name: String,
      color: String,
    }],
    assignees: [{
      login: String,
      avatarUrl: String,
      githubId: Number,
    }],
    reviewers: [{
      login: String,
      avatarUrl: String,
      githubId: Number,
    }],
    commentsCount: {
      type: Number,
      default: 0,
    },
    commitsCount: {
      type: Number,
      default: 0,
    },
    additions: {
      type: Number,
      default: 0,
    },
    deletions: {
      type: Number,
      default: 0,
    },
    changedFiles: {
      type: Number,
      default: 0,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    mergedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    createdAtGithub: {
      type: Date,
    },
    updatedAtGithub: {
      type: Date,
    },
    // AI analysis fields
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', null],
      default: null,
    },
    riskReason: {
      type: String,
      trim: true,
    },
    securityStatus: {
      type: String,
      enum: ['clean', 'flagged', 'pending', null],
      default: null,
    },
    securityFlags: [{
      type: String,
    }],
    aiReview: {
      type: String,
      trim: true,
    },
    aiAnalyzedAt: {
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
pullRequestSchema.index({ state: 1, createdAt: -1 });
pullRequestSchema.index({ repository: 1 });
pullRequestSchema.index({ 'author.login': 1 });
pullRequestSchema.index({ repositoryFullName: 1 });
pullRequestSchema.index({ number: 1, repositoryFullName: 1 });

module.exports = mongoose.model('PullRequest', pullRequestSchema);
