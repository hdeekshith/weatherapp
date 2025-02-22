import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging')
    .default('development'),

  // ✅ Database Configuration
  DATABASE_HOST: Joi.string().hostname().required(),
  DATABASE_PORT: Joi.number().integer().min(1).max(65535).required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().min(8).required(),
  DATABASE_NAME: Joi.string().required(),

  // ✅ Weather API
  WEATHER_API_KEY: Joi.string().min(16).max(64).required(),
  WEATHER_API_URL: Joi.string().uri().required(),

  // ✅ Authentication
  JWT_SECRET: Joi.string().min(8).required(),
  JWT_EXPIRY_TIME: Joi.string()
    .pattern(/^(\d+[smhd])$/)
    .required()
    .messages({
      'string.pattern.base':
        'JWT_EXPIRY_TIME must be in format like "24h", "7d", "1m"',
    }),

  // ✅ Throttling Configuration
  THROTTLE_TTL: Joi.number().integer().positive().default(60000),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(10),

  // ✅ Redis Configuration
  REDIS_HOST: Joi.string().hostname().default('localhost'),
  REDIS_PORT: Joi.number().integer().min(1).max(65535).default(6379),

  // ✅ Cache Configuration
  CACHE_TTL: Joi.number().integer().positive().default(60000),
});
