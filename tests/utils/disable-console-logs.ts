global.console = {
  ...console,
  // AWS SDK usually calls console.error() on failure - we do not need that to log during tests since we assert the failure anyway
  error: jest.fn(),
};
