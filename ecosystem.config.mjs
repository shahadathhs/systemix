export default {
  apps: [
    {
      name: 'vortex-gateway',
      script: './gateway/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'vortex-auth-service',
      script: './services/auth-service/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'vortex-product-service',
      script: './services/product-service/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
      },
    },
    {
      name: 'vortex-order-service',
      script: './services/order-service/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
      },
    },
    {
      name: 'vortex-notification-service',
      script: './services/notification-service/dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
      },
    },
  ],
};
