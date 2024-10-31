// To execute tests, call: npx jest
// Note: The API should already be running
// Note: These tests will pollute the database. Run only in test environments

const request = require('supertest');
const apiEndpoint = 'http://localhost:3000/api';

function randomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 10) + 1;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const userEmail = randomString() + "_test@mail.org";

describe('Person tests', () => {
    it('should return a 201 status code for POST /persons', async () => {
        const userData = {
            "email": userEmail,
            "password": "password",
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/persons')
            .send(userData);
        expect(response.status).toBe(201);
    });

    it('should return a 400 status code for POST /persons', async () => {
        const userData = {
            "password": "password",
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/persons')
            .send(userData);
        expect(response.status).toBe(400);
    });

    it('should return a 400 status code for POST /persons', async () => {
        const userData = {
            "email": "test1@mail.org",
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/persons')
            .send(userData);
        expect(response.status).toBe(400);
    });

    it('should return a 400 status code for POST /persons', async () => {
        const userData = {
            "email": "test1@mail.org",
            "password": "password"
        };
        const response = await request(apiEndpoint)
            .post('/persons')
            .send(userData);
        expect(response.status).toBe(400);
    });

    it('should return a 400 status code for POST /persons', async () => {
        const userData = {
            "email": randomString() + "_test_not_an_email",
            "password": "password",
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/persons')
            .send(userData);
        expect(response.status).toBe(400);
    });
});