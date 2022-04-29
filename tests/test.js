const { app } = require("../src/index");
const request = require("supertest");

const toBeDeleted = [];

// NOTE: due to the downloading of files and dynamic content within the checklists, testing the conversion feature would
// have been difficult with mocha or jest. as such, files were downloaded and validated in WebStorm to ensure they were
// formatted properly. a sample file of each format is included within this directory.

describe("Test register API", () => {
  describe("POST /api/register", () => {
    it("Should create a new user and save into database", (done) => {
      let reqBody = {
        firstName: "Test",
        lastName: "1",
        email: "test1@test.com",
        password: "12345678",
      };
      request(app)
        .post("/api/register")
        .set("Accept", "application/json")
        .send(reqBody)
        .expect(201)
        .end((err, res) => {
          if (err) throw err;
          toBeDeleted.push(res.body.data._id);
          return done();
        });
    });

    it("Should create a new user and save into database", (done) => {
      let reqBody = {
        firstName: "Test",
        lastName: "2",
        email: "test2@test.com",
        password: "12345678",
      };
      request(app)
        .post("/api/register")
        .set("Accept", "application/json")
        .send(reqBody)
        .expect(201)
        .end((err, res) => {
          if (err) throw err;
          toBeDeleted.push(res.body.data._id);
          return done();
        });
    });

    it("Should not create a new user as email is already registered", (done) => {
      let reqBody = {
        firstName: "Test",
        lastName: "1",
        email: "test1@test.com",
        password: "12345678",
      };
      request(app)
        .post("/api/register")
        .set("Accept", "application/json")
        .send(reqBody)
        .expect(400, done);
    });
  });

  describe("DELETE /api/unregister/:id", () => {
    it("Should delete user record from database, expect 204 No Content", (done) => {
      request(app)
        .delete(`/api/unregister/${toBeDeleted[0]}`)
        .expect(204, done);
    });

    it("Should delete user record from database, expect 204 No Content", (done) => {
      request(app)
        .delete(`/api/unregister/${toBeDeleted[1]}`)
        .expect(204, done);
    });

    it("Should not delete user record from database as id is not in the database, expect 400 Bad Request", (done) => {
      request(app)
        .delete(`/api/unregister/92898a2937976b7f8d8ed92c`)
        .expect(400, done);
    });
  });
});