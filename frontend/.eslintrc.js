module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable problematic TypeScript rules for now
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
}