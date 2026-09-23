import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'node:http';
import { createApp, requireExperimentToken } from '../backend/app.js';

async function startTestServer(env) {
  const server = createServer(createApp(env));

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  };
}

describe('backend API', () => {
  let server;

  before(async () => {
    server = await startTestServer({
      APP_NAME: 'Test Env App',
      EXPERIMENT_TOKEN: 'super-secret-test-token',
      WELCOME_MESSAGE: 'Hello from tests.'
    });
  });

  after(async () => {
    await server.close();
  });

  it('returns public configuration', async () => {
    const response = await fetch(`${server.baseUrl}/api/config`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(data, {
      appName: 'Test Env App',
      welcomeMessage: 'Hello from tests.'
    });
  });

  it('returns health status', async () => {
    const response = await fetch(`${server.baseUrl}/api/health`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.status, 'ok');
    assert.equal(data.service, 'backend');
    assert.equal(typeof data.timestamp, 'string');
  });

  it('refuses to create the backend when EXPERIMENT_TOKEN is missing or empty', () => {
    assert.throws(
      () => requireExperimentToken({}),
      /Missing required environment variable: EXPERIMENT_TOKEN/
    );
    assert.throws(
      () => createApp({ EXPERIMENT_TOKEN: '   ' }),
      /Missing required environment variable: EXPERIMENT_TOKEN/
    );
  });

  it('enables the experiment route without exposing the token', async () => {
    const enabledServer = await startTestServer({
      EXPERIMENT_TOKEN: 'super-secret-test-token'
    });

    try {
      const response = await fetch(`${enabledServer.baseUrl}/api/experiment`, { method: 'POST' });
      const data = await response.json();
      const serialized = JSON.stringify(data);

      assert.equal(response.status, 200);
      assert.equal(data.message, 'Experiment endpoint is enabled.');
      assert.equal(data.tokenPresent, true);
      assert.equal(serialized.includes('super-secret-test-token'), false);
    } finally {
      await enabledServer.close();
    }
  });
});
