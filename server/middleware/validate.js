// server/middleware/validate.js
import Joi from 'joi';

export const schemas = {
  // auth
  register: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?\d{7,15}$/).allow('', null),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('learner', 'tutor').required(),
  }),

  testCreate: Joi.object({
    title: Joi.string().required(),
    language: Joi.string().required(),
    durationSec: Joi.number().integer().min(30).max(7200).required(),
    questions: Joi.array().items(Joi.object({
      prompt: Joi.string().required(),
      options: Joi.array().items(Joi.string()).length(4).required(),
      answerIndex: Joi.number().integer().min(0).max(3).required(),
    })).min(1).required(),
    isLive: Joi.boolean().default(false), // created as draft; will be set to live via PATCH
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // lessons & vocab (CRUD)
  lesson: Joi.object({
    language: Joi.string().required(),
    title: Joi.string().required(),
    difficulty: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').default('Beginner'),
    // allow null/empty string from the UI; normalize later if needed
    completedAt: Joi.alternatives().try(Joi.date(), Joi.valid(null), Joi.string().valid('')).default(null),
    notes: Joi.string().allow(''),
  }),

  vocab: Joi.object({
    language: Joi.string().required(),
    term: Joi.string().required(),
    translation: Joi.string().required(),
    partOfSpeech: Joi.string().valid('noun','verb','adj','adv','phrase','other').default('other'),
    example: Joi.string().allow(''),
    learned: Joi.boolean().default(false),
  }),

  // profiles
  learnerProfile: Joi.object({
    gender: Joi.string().valid('male','female','non-binary','prefer-not-to-say'),
    comfortableLanguages: Joi.array().items(Joi.string()).default([]),
    learningLanguage: Joi.string().required(),
    deadline: Joi.date().required(),
    hoursPerDay: Joi.number().min(0).max(24).required(),
    hoursPerWeek: Joi.number().min(0).max(168).required(),
  }),

  tutorProfile: Joi.object({
    gender: Joi.string().valid('male','female','non-binary','prefer-not-to-say'),
    comfortableLanguages: Joi.array().items(Joi.string()).default([]),
    teachingLanguages: Joi.array().items(Joi.string()).min(1).required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),

  // tests
  testCreate: Joi.object({
    title: Joi.string().required(),
    language: Joi.string().required(),
    durationSec: Joi.number().integer().min(30).max(7200).required(),
    questions: Joi.array().items(Joi.object({
      prompt: Joi.string().required(),
      options: Joi.array().items(Joi.string()).min(2).required(),
      answerIndex: Joi.number().integer().min(0).required(),
    })).min(1).required(),
    isLive: Joi.boolean().default(true),
  }),

  submitAnswers: Joi.object({
    answers: Joi.array().items(Joi.object({
      qIndex: Joi.number().integer().min(0).required(),
      optionIndex: Joi.number().integer().min(0).required(),
    })).required(),
  }),

  // study log
  studyLog: Joi.object({
    date: Joi.date().required(),
    hours: Joi.number().min(0).max(24).required(),
  }),
};

export function validateBody(schema) {
  return (req, _res, next) => {
    if (!schema) {
      const err = new Error('Validation schema missing');
      err.status = 500;
      return next(err);
    }
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      error.status = 400;
      error.message = error.details.map(d => d.message).join(', ');
      return next(error);
    }
    req.body = value;
    next();
  };
}