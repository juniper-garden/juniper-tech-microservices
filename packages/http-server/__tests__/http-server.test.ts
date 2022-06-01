const app = require('../lib/http-server')
const request = require('supertest');


describe('http-server', () => {
    xit('needs tests', (done) => {
        request(app).get('/').expect(200, done)
    });
});
