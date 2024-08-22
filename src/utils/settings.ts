import { config } from 'dotenv';
import { logger } from './logger.js';
import Joi from 'joi';

type Settings = {
  OPENAI_API_KEY: string;
  PROXY: string;
  SMTP_DB: string;
};

const parsedSettings = config();
if (!parsedSettings.parsed) {
  logger.error({
    msg: 'Failed to parse settings',
    error: parsedSettings.error,
  });

  process.exit(-1);
}

const checkedSettings = Joi.object<Settings, true, Settings>({
  OPENAI_API_KEY: Joi.string().required(),
  PROXY: Joi.string()
    .regex(
      /http:\/\/[a-z0-9_\-]+:[a-z0-9!@#$%^&*()_\-+\\\/\.]+@\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/i,
    )
    .required(),
  SMTP_DB: Joi.string().required(),
}).validate(parsedSettings.parsed);

if (checkedSettings.error) {
  logger.error({
    msg: 'Settings validation error',
    error: checkedSettings.error,
  });

  process.exit(-1);
}

const settings = checkedSettings.value as Settings;
export default settings;
