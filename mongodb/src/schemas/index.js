const Joi = require('joi');

const userSchema = Joi.object({
  githubId: Joi.number().required(),
  username: Joi.string().required(),
  email: Joi.string().email().allow(null, ''),
  avatarUrl: Joi.string().uri().allow(null, ''),
  profileUrl: Joi.string().uri().allow(null, ''),
  accessTokenEncrypted: Joi.string().allow(null, ''),
  role: Joi.string().valid('user', 'admin').default('user')
}).unknown(false);

const repoSchema = Joi.object({
  githubId: Joi.number().required(),
  name: Joi.string().required(),
  fullName: Joi.string().required(),
  owner: Joi.object({
    login: Joi.string().required(),
    id: Joi.number().required(),
    avatarUrl: Joi.string().uri().allow(null, '')
  }).required(),
  description: Joi.string().allow(null, ''),
  url: Joi.string().uri().required(),
  isPrivate: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  users: Joi.array().items(Joi.string()).default([])
}).unknown(true);

const prSchema = Joi.object({
  githubId: Joi.number().required(),
  number: Joi.number().required(),
  title: Joi.string().required(),
  state: Joi.string().valid('open', 'closed', 'merged').required(),
  author: Joi.object({
    login: Joi.string().required(),
    id: Joi.number().required(),
    avatarUrl: Joi.string().uri().allow(null, '')
  }).required(),
  url: Joi.string().uri().required(),
  repository: Joi.string().required(), // ObjectId as string
  body: Joi.string().allow(null, ''),
  createdAtGithub: Joi.date().iso().required(),
  updatedAtGithub: Joi.date().iso().required(),
  closedAtGithub: Joi.date().iso().allow(null),
  mergedAtGithub: Joi.date().iso().allow(null),
  labels: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      color: Joi.string().allow(null, '')
    })
  ).default([])
}).unknown(true);

const reviewSchema = Joi.object({
  githubId: Joi.number().required(),
  pullRequest: Joi.string().required(), // ObjectId as string
  pullRequestNumber: Joi.number().required(),
  user: Joi.object({
    login: Joi.string().required(),
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
