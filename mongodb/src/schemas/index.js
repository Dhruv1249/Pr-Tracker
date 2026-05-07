const Joi = require('joi');

const userSchema = Joi.object({
  githubId: Joi.number().required(),
  username: Joi.string().required(),
  email: Joi.string().email().allow(null, ''),
  avatarUrl: Joi.string().uri().allow(null, ''),
  accessTokenEncrypted: Joi.string().allow(null, ''),
}).unknown(true);

const repoSchema = Joi.object({
  githubId: Joi.number().required(),
  name: Joi.string().required(),
  fullName: Joi.string().required(),
  owner: Joi.object({
    login: Joi.string().required(),
    githubId: Joi.number().optional(),
    id: Joi.number().optional(),
    avatarUrl: Joi.string().uri().allow(null, '')
  }).required(),
  description: Joi.string().allow(null, ''),
  url: Joi.string().uri().required(),
  private: Joi.boolean().default(false),
  isPrivate: Joi.boolean().optional(),
  isActive: Joi.boolean().default(true),
  users: Joi.array().items(Joi.string()).default([])
}).unknown(true);

const prSchema = Joi.object({
  githubId: Joi.number().required(),
  number: Joi.number().required(),
  title: Joi.string().required(),
  state: Joi.string().valid('open', 'closed', 'merged', 'draft').required(),
  author: Joi.object({
    login: Joi.string().required(),
    githubId: Joi.number().optional(),
    id: Joi.number().optional(),
    avatarUrl: Joi.string().uri().allow(null, '')
  }).required(),
  url: Joi.string().uri().required(),
  repository: Joi.string().required(), // ObjectId as string
  repositoryFullName: Joi.string().optional(),
  body: Joi.string().allow(null, ''),
  createdAtGithub: Joi.date().iso().required(),
  updatedAtGithub: Joi.date().iso().required(),
  closedAt: Joi.date().iso().allow(null),
  mergedAt: Joi.date().iso().allow(null),
}).unknown(true);

const reviewSchema = Joi.object({
  githubId: Joi.number().required(),
  pullRequest: Joi.string().required(), // ObjectId as string
  pullRequestNumber: Joi.number().required(),
  user: Joi.object({
    login: Joi.string().required(),
    githubId: Joi.number().optional(),
    id: Joi.number().optional(),
    avatarUrl: Joi.string().uri().allow(null, '')
  }).required(),
  state: Joi.string().required(),
  body: Joi.string().allow(null, ''),
  submittedAt: Joi.date().iso().required()
}).unknown(true);

module.exports = {
  userSchema,
  repoSchema,
  prSchema,
  reviewSchema
};
