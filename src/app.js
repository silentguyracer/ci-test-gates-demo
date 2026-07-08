const appInsights = require('applicationinsights');
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .start();
}

const express = require('express');
const math = require('./math');

const app = express();

app.use(express.json());

// Handle malformed JSON requests
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload' });
  }
  next(err);
});

// Status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Continuous Integration Demo API is running',
    timestamp: new Date().toISOString()
  });
});

// Calculator endpoint
app.post('/api/calculate', (req, res) => {
  const { op, a, b } = req.body;

  // Validation
  if (op === undefined || a === undefined || b === undefined) {
    return res.status(400).json({
      error: 'Missing required parameters: op, a, b'
    });
  }

  const numA = Number(a);
  const numB = Number(b);

  if (isNaN(numA) || isNaN(numB)) {
    return res.status(400).json({
      error: 'Parameters a and b must be valid numbers'
    });
  }

  try {
    let result;
    switch (op) {
      case 'add':
        result = math.add(numA, numB);
        break;
      case 'subtract':
        result = math.subtract(numA, numB);
        break;
      case 'multiply':
        result = math.multiply(numA, numB);
        break;
      case 'divide':
        result = math.divide(numA, numB);
        break;
      default:
        return res.status(400).json({
          error: `Invalid operator '${op}'. Supported operators: add, subtract, multiply, divide`
        });
    }

    return res.status(200).json({
      operator: op,
      a: numA,
      b: numB,
      result
    });
  } catch (error) {
    return res.status(422).json({
      error: error.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
