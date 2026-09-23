import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ENV_PATH = '.env';
const defaults = {
  APP_NAME: 'Test Repo Env Vars',
  WELCOME_MESSAGE: 'Welcome! Change these values, restart the backend, and watch the UI update.',
  FRONTEND_HOST: '0.0.0.0',
  FRONTEND_PORT: '3000',
  BACKEND_HOST: '127.0.0.1',
  BACKEND_PORT: '8787'
};

const rl = createInterface({ input, output });

function normalizeYesNo(value) {
  return value.trim().toLowerCase();
}

async function ask(question, defaultValue) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultValue;
}

async function askRequired(question) {
  while (true) {
    const answer = (await rl.question(`${question}: `)).trim();

    if (answer) {
      return answer;
    }

    console.log('A non-empty EXPERIMENT_TOKEN is required for backend startup.');
  }
}

async function askYesNo(question, defaultValue = false) {
  const suffix = defaultValue ? 'Y/n' : 'y/N';
  const answer = normalizeYesNo(await rl.question(`${question} (${suffix}): `));

  if (!answer) return defaultValue;
  return answer === 'y' || answer === 'yes';
}

function quoteEnvValue(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function renderEnv(values) {
  const lines = [
    '# Public app copy served by the backend. These values are safe to show in the browser.',
    `APP_NAME=${quoteEnvValue(values.APP_NAME)}`,
    `WELCOME_MESSAGE=${quoteEnvValue(values.WELCOME_MESSAGE)}`,
    '',
    '# Local server ports.',
    `FRONTEND_HOST=${values.FRONTEND_HOST}`,
    `FRONTEND_PORT=${values.FRONTEND_PORT}`,
    `BACKEND_HOST=${values.BACKEND_HOST}`,
    `BACKEND_PORT=${values.BACKEND_PORT}`,
    '',
    '# Optional preview port fallback.',
    `PORT=${values.FRONTEND_PORT}`,
    '',
    '# Required server-only variable. The browser never receives this value.',
    `EXPERIMENT_TOKEN=${quoteEnvValue(values.EXPERIMENT_TOKEN)}`
  ];

  return `${lines.join('\n')}\n`;
}

try {
  console.log('Create a local .env file for Test Repo Env Vars.');
  console.log('Press Enter to accept any default.\n');

  if (existsSync(ENV_PATH)) {
    const overwrite = await askYesNo('.env already exists. Overwrite it?', false);
    if (!overwrite) {
      console.log('Leaving existing .env unchanged.');
      process.exit(0);
    }
  }

  const values = {
    APP_NAME: await ask('App name', defaults.APP_NAME),
    WELCOME_MESSAGE: await ask('Welcome message', defaults.WELCOME_MESSAGE),
    FRONTEND_HOST: defaults.FRONTEND_HOST,
    FRONTEND_PORT: await ask('Frontend preview port', defaults.FRONTEND_PORT),
    BACKEND_HOST: defaults.BACKEND_HOST,
    BACKEND_PORT: await ask('Backend API port', defaults.BACKEND_PORT),
    EXPERIMENT_TOKEN: await askRequired('EXPERIMENT_TOKEN (required)')
  };

  await writeFile(ENV_PATH, renderEnv(values), 'utf8');

  console.log('\nWrote .env.');
  console.log('Run npm run dev, then open http://localhost:%s', values.FRONTEND_PORT);
  console.log('Restart npm run dev after changing .env values.');
} finally {
  rl.close();
}
