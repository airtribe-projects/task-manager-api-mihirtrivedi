const request = require('supertest');
const express = require('express');
const userRoutes = require('../src/routes/userRoutes');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe('Auth API', () => {
    // We use a fresh email every time to avoid conflicts
    const uniqueEmail = `test_${Date.now()}@example.com`;

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/register')
            .send({
                fullName: "Test User",
                email: uniqueEmail,
                password: "Password123!",
                // FIX: Must be an array to pass your validation middleware
                preferences: ["technology", "science"]
            });

        if (res.statusCode !== 201) {
            console.log('REGISTRATION FAILED:', res.body);
        }

        expect(res.statusCode).toEqual(201);
    });

    it('should login the user and return a token', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({
                email: uniqueEmail,
                password: "Password123!"
            });

        if (res.statusCode !== 200) {
            console.log('LOGIN FAILED:', res.body);
        }

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
