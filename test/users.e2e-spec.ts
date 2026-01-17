import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  let createdRoleId: number;
  let createdUserId: number;

  it('Create Role', async () => {
    const res = await request(app.getHttpServer())
      .post('/roles')
      .send({ name: 'Test Role' })
      .expect(201);
    createdRoleId = res.body.id;
  });

  it('/users (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        roleId: createdRoleId,
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('John Doe');
    createdUserId = res.body.id;
  });

  it('/users (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    const user = res.body.find((u) => u.id === createdUserId);
    expect(user).toBeDefined();
    expect(user.role).toBeDefined();
  });

  it('/users/:id (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .expect(200);

    expect(res.body.id).toEqual(createdUserId);
    expect(res.body.name).toEqual('John Doe');
  });

  it('/users/:id (PATCH)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .send({ name: 'Jane Doe' })
      .expect(200);

    expect(res.body.name).toEqual('Jane Doe');
  });

  it('/users/:id (DELETE)', () => {
    return request(app.getHttpServer())
      .delete(`/users/${createdUserId}`)
      .expect(200);
  });

  // Cleanup Role
  it('Delete Role', () => {
    return request(app.getHttpServer())
      .delete(`/roles/${createdRoleId}`)
      .expect(200);
  });
});
