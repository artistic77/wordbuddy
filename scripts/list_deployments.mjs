import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    value = value.trim().replace(/^['"]|['"]$/g, '');
    env[match[1]] = value;
  }
});

const endpoint = (env.VITE_AZURE_OPENAI_ENDPOINT || '').replace(/\/+$/, '');
const key = env.VITE_AZURE_OPENAI_KEY;

console.log('Listing deployments for endpoint:', endpoint);

async function listDeployments() {
  const url = `${endpoint}/openai/deployments?api-version=2024-08-01-preview`;
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': key,
      },
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Deployments response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error listing deployments:', err);
  }
}

listDeployments();
