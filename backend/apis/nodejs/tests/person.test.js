// Run me with "npm test"

const request = require('supertest')
const app = require('../src/app')
require('dotenv').config({ path: '../src/.env' })

describe('Person Tests', () => {
  test('Correct registration', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'johntestdoe@mail.org',
        password: 'password',
        display_name: 'John Doe'
      })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ activationLink: expect.any(String) })
  })

  test('Incorrect registration', async () => {
    const response = await request(app)
      .post('/api/register')
      .send({
        email: 'this is not an email',
        password: 'password',
        display_name: 'John Doe'
      })
    expect(response.status).toBe(400)
  })
})
