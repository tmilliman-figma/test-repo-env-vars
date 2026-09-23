import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialConfig = {
  appName: 'Test Repo Env Vars',
  welcomeMessage: 'Loading environment-backed configuration...'
};

function App() {
  const [config, setConfig] = useState(initialConfig);
  const [health, setHealth] = useState({ state: 'loading', message: 'Checking backend...' });
  const [apiResult, setApiResult] = useState(null);
  const [experimentResult, setExperimentResult] = useState(null);

  useEffect(() => {
    refreshConfig();
    checkHealth();
  }, []);

  async function requestJson(path, options = {}) {
    const response = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || `Request failed with ${response.status}`;
      const error = new Error(message);
      error.payload = data;
      throw error;
    }
    return data;
  }

  async function refreshConfig() {
    try {
      const data = await requestJson('/api/config');
      setConfig(data);
    } catch (error) {
      setConfig({
        appName: initialConfig.appName,
        welcomeMessage: 'Could not load backend configuration.'
      });
    }
  }

  async function checkHealth() {
    setHealth({ state: 'loading', message: 'Checking backend...' });
    try {
      const data = await requestJson('/api/health');
      setHealth({
        state: 'ok',
        message: `${data.service} is ${data.status}`,
        detail: `Updated ${new Date(data.timestamp).toLocaleTimeString()}`
      });
    } catch (error) {
      setHealth({
        state: 'error',
        message: 'Backend is unavailable',
        detail: error.message
      });
    }
  }

  async function callPing() {
    setApiResult({ state: 'loading', message: 'Calling /api/ping...' });
    try {
      const data = await requestJson('/api/ping', {
        method: 'POST',
        body: JSON.stringify({ source: 'browser-button' })
      });
      setApiResult({ state: 'ok', message: data.message });
    } catch (error) {
      setApiResult({ state: 'error', message: error.message });
    }
  }

  async function callExperiment() {
    setExperimentResult({ state: 'loading', message: 'Checking EXPERIMENT_TOKEN...' });
    try {
      const data = await requestJson('/api/experiment', { method: 'POST' });
      setExperimentResult({
        state: 'ok',
        message: data.message
      });
    } catch (error) {
      setExperimentResult({
        state: 'error',
        message: error.message,
        variable: error.payload?.error?.variable
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="intro">
        <p className="eyebrow">Environment variable demo</p>
        <h1>{config.appName}</h1>
        <p className="welcome">{config.welcomeMessage}</p>
      </section>

      <section className="status-panel" aria-label="Backend status">
        <div>
          <p className="section-label">Backend health</p>
          <h2 className={health.state === 'error' ? 'danger-text' : ''}>{health.message}</h2>
          {health.detail ? <p className="muted">{health.detail}</p> : null}
        </div>
        <span className={`status-dot ${health.state}`} aria-label={`Health status: ${health.state}`} />
      </section>

      <section className="controls" aria-label="API controls">
        <button type="button" onClick={checkHealth}>Refresh Health</button>
        <button type="button" onClick={callPing}>Test Ping</button>
        <button type="button" className="primary" onClick={callExperiment}>Run Experiment</button>
      </section>

      <section className="results" aria-label="API results">
        <ResultCard title="Ping endpoint" result={apiResult} empty="Click Test Ping to call a normal API route." />
        <ResultCard
          title="Experiment endpoint"
          result={experimentResult}
          empty="Click Run Experiment to test EXPERIMENT_TOKEN."
        />
      </section>
    </main>
  );
}

function ResultCard({ title, result, empty }) {
  return (
    <article className={`result-card ${result?.state || 'idle'}`}>
      <p className="section-label">{title}</p>
      <p className="result-message">{result?.message || empty}</p>
      {result?.variable ? <p className="missing-var">Missing variable: {result.variable}</p> : null}
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
