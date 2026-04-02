const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema(
  {
    githubId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      login: String,
      avatarUrl: String,
      githubId: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    private: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      trim: true,
    },
    stargazersCount: {
      type: Number,
      default: 0,
    },
    forksCount: {
      type: Number,
      default: 0,
    },
    openIssuesCount: {
      type: Number,
      default: 0,
    },
    defaultBranch: {
      type: String,
      default: 'main',
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
repositorySchema.index({ fullName: 1 });
repositorySchema.index({ 'owner.login': 1 });
repositorySchema.index({ language: 1 });
repositorySchema.index({ isActive: 1 });

module.exports = mongoose.model('Repository', repositorySchema);
