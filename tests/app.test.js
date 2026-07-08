const request = require('supertest');
const app = require('../src/app');

describe('Express API Integration Tests', () => {
  describe('GET / (Status/Health Check)', () => {
    it('should return 200 OK with healthy status and metadata', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/calculate', () => {
    it('should successfully add two numbers', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'add', a: 10, b: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        operator: 'add',
        a: 10,
        b: 5,
        result: 15
      });
    });

    it('should successfully divide two numbers', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'divide', a: 15, b: 3 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        operator: 'divide',
        a: 15,
        b: 3,
        result: 5
      });
    });

    it('should successfully subtract two numbers', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'subtract', a: 10, b: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        operator: 'subtract',
        a: 10,
        b: 4,
        result: 6
      });
    });

    it('should successfully multiply two numbers', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'multiply', a: 3, b: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        operator: 'multiply',
        a: 3,
        b: 4,
        result: 12
      });
    });

    it('should return 400 when parameters are missing', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'add', a: 10 }); // missing b

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Missing required parameters');
    });

    it('should return 400 when parameters are not numbers', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'add', a: 'ten', b: 5 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('must be valid numbers');
    });

    it('should return 400 when operator is invalid', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'power', a: 2, b: 3 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid operator');
    });

    it('should return 422 when attempting to divide by zero', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .send({ op: 'divide', a: 10, b: 0 });

      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        error: 'Cannot divide by zero'
      });
    });

    it('should return 400 when JSON payload is malformed', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .set('Content-Type', 'application/json')
        .send('{"op": "add", "a": 10, "b": ');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Malformed JSON payload'
      });
    });

    it('should pass non-syntax errors (like content encoding errors) to next(err)', async () => {
      const response = await request(app)
        .post('/api/calculate')
        .set('Content-Type', 'application/json')
        .set('Content-Encoding', 'gzip')
        .send('{"op": "add", "a": 1, "b": 2}');

      expect(response.status).toBe(400);
      expect(response.body).not.toHaveProperty('error', 'Malformed JSON payload');
    });
  });

  describe('404 Route Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app).get('/invalid-route-path');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Route not found' });
    });
  });
});
