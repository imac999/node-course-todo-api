const {ObjectID} = require("mongodb");
const expect = require("expect");
const request = require("supertest");

const {app} = require("./../server");
const {Todo} = require("./../models/todo");

const testTodos=[{
  _id: new ObjectID(),
  text: 'first text todo',
},{
  _id: new ObjectID(),
  text: 'second text todo',
}]

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(testTodos);
  }).then(() => done());
});


describe('POST /todos', () => {
    it('should create a new todo today', (done) => {
      var text= 'test todo text';

      request(app)
        .post('/todos')
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
        .expect(200)
        .expect((res) => {
          expect(res.body.todos.length).toBe(testTodos.length);
        })
        .end(done);
    });
  });

  describe('GET /todos/:id', () => {
    it('should get a todo', (done) => {
      request(app)
        .get(`/todos/${testTodos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.todo.text).toBe(testTodos[0].text);
        })
        .end(done);
    });
    it('should return 404 if not found', (done) => {
      request(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done);
    });
    it('should return 404 if invalid id sent', (done) => {
      request(app)
        .get(`/todos/123`)
        .expect(404)
        .end(done);
    });
  });

    describe('DELETE /todos/:id', () => {
      it('should delete a todo', (done) => {
        request(app)
          .delete(`/todos/${testTodos[0]._id.toHexString()}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.todo.text).toBe(testTodos[0].text);
          })
          .end((err, res) => {
            if (err){
              return done(err);
            }else{
              Todo.findById(testTodos[0]._id.toHexString())
              .then((todo) => {
                expect(todo).toBeNull();
                return done();
              }).catch((e) => done(e));
            }
          });
      });
      it('should return 404 if not found', (done) => {
        request(app)
          .delete(`/todos/${new ObjectID().toHexString()}`)
          .expect(404)
          .end(done);
      });
      it('should return 404 if invalid id sent', (done) => {
        request(app)
          .delete(`/todos/123`)
          .expect(404)
          .end(done);
      });
    });
