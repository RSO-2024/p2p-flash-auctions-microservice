import request from 'supertest';
import app from '../server';

describe('API Endpoints', () => {

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

  it('Return data for auctions', async () => {
    const response = await request(app).get('/api/flash-auctions/data').send(
        {
            "query": {
                "has_ended": true
            }
        }
    );

    expect(response.status).toBe(200);
  });

  // Test POST /api/data - Success
  it('Reject request without authentication', async () => {
    const response = await request(app).post('/api/flash-auctions/data').send(
        {
            "listing_id": 16,
            "start_time": "2024-12-11T20:16:37+01:00",
            "end_time": "2024-12-11T21:35:37+01:00",
            "is_flash": true
        }
    )
    expect(response.status).toBe(401);
  });


  it('Check config endpoint', async () => {
    const response = await request(app).get('/api/flash-auctions/config');
    expect(response.status).toBe(200);
  });

  it('Check health endpoint', async () => {
    const response = await request(app).get('/api/flash-auctions/health/');

    expect(response.status).toBe(200);
    expect(response.body.status).toEqual("success");
  });
});
