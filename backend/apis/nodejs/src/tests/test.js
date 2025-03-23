// To execute tests, call: npx jest
// Note: The API should already be running
// Note: These tests will pollute the database. Run only in test environments

const request = require('supertest');
const apiEndpoint = 'http://localhost:3000/api';

let bearerToken;

function randomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * 10) + 1;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

describe('Person tests', () => {
    const userEmail = randomString() + "_test@mail.org";
    const userPassword = "password"

    // Correct registration
    it('should return a 201 status code for POST /people', async () => {
        const userData = {
            "email": userEmail,
            "password": userPassword,
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/people')
            .send(userData);
        expect(response.status).toBe(201);
        bearerToken = response.body.token;
    });

    // Registration with no email
    it('should return a 400 status code for POST /people', async () => {
        const userData = {
            "password": userPassword,
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/people')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Registration with no password
    it('should return a 400 status code for POST /people', async () => {
        const userData = {
            "email": "test1@mail.org",
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/people')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Registration with no display name
    it('should return a 400 status code for POST /people', async () => {
        const userData = {
            "email": "test1@mail.org",
            "password": userPassword
        };
        const response = await request(apiEndpoint)
            .post('/people')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Registration with an e-mail which is not a valid e-mail
    it('should return a 400 status code for POST /people', async () => {
        const userData = {
            "email": randomString() + "_test_not_an_email",
            "password": userPassword,
            "displayName": "Test1",
        };
        const response = await request(apiEndpoint)
            .post('/people')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Correct login
    it('should return a 200 status code for POST /people/me/token', async () => {
        const userData = {
            "email": userEmail,
            "password": userPassword
        };
        const response = await request(apiEndpoint)
            .post('/people/me/token')
            .send(userData);
        expect(response.status).toBe(200);
        bearerToken = response.body.token;
    });

    // Login with wrong password
    it('should return a 401 status code for POST /people/me/token', async () => {
        const userData = {
            "email": userEmail,
            "password": randomString()
        };
        const response = await request(apiEndpoint)
            .post('/people/me/token')
            .send(userData);
        expect(response.status).toBe(401);
    });

    // Login without password
    it('should return a 400 status code for POST /people/me/token', async () => {
        const userData = {
            "email": userEmail
        };
        const response = await request(apiEndpoint)
            .post('/people/me/token')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Login without email
    it('should return a 400 status code for POST /people/me/token', async () => {
        const userData = {
            "password": randomString()
        };
        const response = await request(apiEndpoint)
            .post('/people/me/token')
            .send(userData);
        expect(response.status).toBe(400);
    });

    // Get myself
    it('should return a 200 status code for GET /people/me', async () => {
        const response = await request(apiEndpoint)
            .get('/people/me')
            .set("Authorization", `Bearer ${bearerToken}`)
            .send();
        expect(response.status).toBe(200);
    });

    // Get myself without token
    it('should return a 401 status code for GET /people/me', async () => {
        const response = await request(apiEndpoint)
            .get('/people/me')
            .send();
        expect(response.status).toBe(401);
    });

    // Get myself with invalid token
    it('should return a 401 status code for POST /people/me', async () => {
        const response = await request(apiEndpoint)
            .get('/people/me')
            .set("Authorization", `Bearer this_is_not_a_valid_bearer`)
            .send();
        expect(response.status).toBe(401);
    });
});