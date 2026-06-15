module.exports = {
  apps: [
    {
      name: 'aviator-ui',
      cwd: '/opt/aviator/aviat',
      script: '/usr/bin/bash',
      args: '-lc "npm run start -- -p 3000"',
      interpreter: 'none',
      env: {
        PORT: '3000',
      },
      autorestart: true,
    },
    {
      name: 'aviator-loop',
      cwd: '/opt/aviator/aviat',
      script: '/usr/bin/bash',
      args: '-lc "node scripts/game-loop.js"',
      interpreter: 'none',
      env: {
        API_URL: 'http://127.0.0.1:3000',
      },
      autorestart: true,
    },
    {
      name: 'aviator-server',
      cwd: '/opt/aviator/aviator_server',
      script: '/usr/bin/node',
      args: 'index.js',
      interpreter: 'none',
      autorestart: true,
    },
  ],
};
