const {ObjectID} = require("mongodb");
const expect = require("expect");
const request = require("supertest");

const {app} = require("./../server");
const {Todo} = require("./../models/todo");
const {User} = require("./../models/user");

const {testTodos, populateTodos, users, populateUsers} = require("./seed/seed");

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo today', (done) => {
      var text= 'test todo text';

      request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res) => {
          expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if(err){
              return done(err);
            }
            Todo.find().then((todos) => {
              expect(todos.length).toBe(testTodos.length+1);
              expect(todos[testTodos.length].text).toBe(text);
              done();
            }).catch((e) => done(e));
        });
    });

    it('should not create with bad data', (done) => {

    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400)
      .end((err, res) => {
          if(err){
            return done(err);
          }
          Todo.find().then((todos) => {
            expect(todos.length).toBe(testTodos.length);
            done();
          }).catch((e) => done(e));
      });
    });
  });

  describe('GET /todos', () => {
    it('should get all todos', (done) => {

      request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
  });

  describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
    request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(users[0]._id.toHexString());
          expect(res.body.email).toBe(users[0].email);
        })
        .end(done);
    });
    it('should 401 if not authenticated', (done) => {
    request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).toEqual({});
        })
        .end(done);
    });
  });

  describe('GET /todos/:id', () => {
    it('should get a todo', (done) => {
      request(app)
        .get(`/todos/${testTodos[0]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(testTodos[0].text);
        })
        .end(done);
    });
    it('should not get a todo if created by another user', (done) => {
      request(app)
        .get(`/todos/${testTodos[1]._id.toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 if not found', (done) => {
      request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 if invalid id sent', (done) => {
      request(app)
        .get(`/todos/123`)
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete a todo', (done) => {
      request(app)
        .delete(`/todos/${testTodos[1]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(testTodos[1].text);
        })
        .end((err, res) => {
          if (err){
            return done(err);
          }else{
            Todo.findById(testTodos[1]._id.toHexString())
            .then((todo) => {
              expect(todo).toBeNull();
              return done();
            }).catch((e) => done(e));
          }
        });
    });
    it('should not delete a todo we do not own', (done) => {
      request(app)
        .delete(`/todos/${testTodos[0]._id.toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end((err, res) => {
          if (err){
            return done(err);
          }else{
            Todo.findById(testTodos[1]._id.toHexString())
            .then((todo) => {
              expect(todo).toBeTruthy();
              return done();
            }).catch((e) => done(e));
          }
        });
    });
    it('should return 404 if not found', (done) => {
      request(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 if invalid id sent', (done) => {
      request(app)
        .delete(`/todos/123`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
  });

  describe('PATCH /todos/:id', () => {
      it('should update fields and insert completedAt', (done) => {
        var text='This is the updated text';
        request(app)
          .patch(`/todos/${testTodos[0]._id.toHexString()}`)
          .set('x-auth', users[0].tokens[0].token)
          .send({
            completed: true,
            text
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(typeof res.body.todo.completedAt).toBe('number');
          })
          .end((err, res) => {
            if(err){
              return done(err);
            }else{
              Todo.findById(testTodos[0]._id.toHexString()).then((todo) => {
                expect(todo.text).toBe(text);
                expect(todo.completed).toBe(true);
                expect(typeof res.body.todo.completedAt).toBe('number');
                return done();
              }).catch((e) => done(e));
            }
          });
      });
      it('should not update fields if not created by user', (done) => {
        var text='This is the updated text';
        request(app)
          .patch(`/todos/${testTodos[0]._id.toHexString()}`)
          .set('x-auth', users[1].tokens[0].token)
          .send({
            completed: true,
            text
          })
          .expect(404)
          .end((err, res) => {
            if(err){
              return done(err);
            }else{
              Todo.findById(testTodos[0]._id.toHexString()).then((todo) => {
                expect(todo.text).not.toBe(text);
                return done();
              }).catch((e) => done(e));
            }
          });
      });
      it('should clear completedAt when to not complete', (done) => {
        var text='more updated text';
        request(app)
          .patch(`/todos/${testTodos[1]._id.toHexString()}`)
          .set('x-auth', users[1].tokens[0].token)
          .send({
            text,
            completed: false
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBeNull();
          })
          .end((err, res) => {
            if(err){
              return done(err);
            }else{
              Todo.findById(testTodos[1]._id.toHexString()).then((todo) => {
                expect(todo.text).toBe(text);
                expect(todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBeNull();
                return done();
              }).catch((e) => done(e));
            }
          });
      });
    });

    describe('POST /users', () => {
        it('should create a new user', (done) => {
          var email= 'a@b.com';
          var password='abcdef';

          request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
              expect(res.headers['x-auth']).toBeTruthy();
              expect(res.body._id).toBeTruthy();
              expect(res.body.email).toBe(email);
            })
            .end((err, res) => {
                if(err){
                  return done(err);
                }
                User.findOne({email}).then((user) => {
                  expect(user).toBeTruthy();
                  expect(user.password).not.toBe(password);
                  done();
                }).catch((e) => done(e));
            });
        });

        it('should return validation errors for invalid request', (done) => {
          var email= 'x';
          var password='abcdef';
          request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
        });

        it('should not create user for existing email', (done) => {
          request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .end(done);
        });

      });

    describe('POST /users/login', () => {
      it('should login and return x-auth token', (done) => {
        var testUser=users[1];
        request(app)
          .post('/users/login')
          .send({email: testUser.email, password: testUser.password})
          .expect(200)
          .expect((res) => {
            expect(res.headers['x-auth']).toBeTruthy();
          })
          .end((err, res) => {
              if(err){
                return done(err);
              }
              User.findById(testUser._id).then((user) => {
                expect(user).toBeTruthy();
                expect(user.tokens[user.tokens.length - 1].token).toBe(res.headers['x-auth']);
                done();
              }).catch((e) => done(e));
          });
      });
      it('should reject invalid login', (done) => {
        request(app)
          .post('/users/login')
          .send({email: users[0].email, password: 'not the password'})
          .expect(400)
          .end(done);
      });
    });
    describe('DELETE /users/me/token', () => {
      it('should remove x-auth token on logout', (done) => {
        var testUser=users[0];
        request(app)
          .delete('/users/me/token')
          .set('x-auth', testUser.tokens[0].token)
          .send()
          .expect(200)
          .end((err, res) => {
              if(err){
                return done(err);
              }
              User.findById(testUser._id).then((user) => {
                expect(user).toBeTruthy();
                expect(user.tokens.length).toBe(0);
                done();
              }).catch((e) => done(e));
          });
      });
    });
