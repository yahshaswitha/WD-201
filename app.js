const express = require("express");
const app = express();
const { Todo } = require("./models");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/", function (request, response) {
  response.send("Hello World");
});

app.get("/todos", async function (_request, response) {

  console.log("Processing list of all Todos ...");

  try{
    const todo = await Todo.getTodos();
    return response.json(todo);
  } 
  catch(e){
    console.log(e);
    return response.status(422).json(e);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async function (request, response) {
  try {
    const todo = await Todo.addTodo(request.body);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id/markAsCompleted", async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {

  console.log("We have to delete a Todo with ID: ", request.params.id);
  
  const todo = await Todo.findByPk(request.params.id);

  if(todo){
    try{
      const toBeDeletedtodo = await todo.deleteTodo();
      return response.send(toBeDeletedtodo ? true : false);
    }
    catch (e) {
      console.log(e);
      return response.status(422).json(e);
    }
  } 
  else{
    return response.send(false);
  }

});

module.exports = app;