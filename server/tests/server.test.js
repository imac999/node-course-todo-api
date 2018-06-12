const expect = require("expect");
const request = require("supertest");

const {app} = require("./../server");
const {Todo} = require("./../models/todo");

const testTodos=[{
  text: 'first text todo',
},{
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
