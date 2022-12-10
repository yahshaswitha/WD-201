const express = require("express");
const app = express();
const path = require("path");
const { Todo } = require("./models");
const bodyParser = require("body-parser");
const csrf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_charactes_long", ["PUT", "POST", "DELETE"]));

app.get("/", async function (request, response) {
  try {
    const overdueItems = await Todo.getOverdueItems();
    const dueTodayItems = await Todo.getDueTodayItems();
    const dueLaterItems = await Todo.getDueLaterItems();
    const completedItems = await Todo.getCompletedTodos();

    if (request.accepts("html")) {
      return response.render("index", {
        overdueItems,
        dueTodayItems,
        dueLaterItems,
        completedItems,
        csrfToken: request.csrfToken(),
      });
    } else {
      return response.json({
        overdueItems,
        dueTodayItems,
        dueLaterItems,
        completedItems,
      });
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.get("/todos", async function (_request, response) {
  console.log("getting the list all Todos ...");

  try {
    const todos = await Todo.getTodos();
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
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
  console.log("creating new todo", request.body);
  try {
    await Todo.addTodo(request.body);
    return response.redirect("/");
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.put("/todos/:id", async function (request, response) {
  console.log("Mark Todo as completed:", request.params.id);
  const todo = await Todo.findByPk(request.params.id);
  const completedStatus = request.body.completed;

  try {
    const updatedTodo = await todo.setCompletionStatus(completedStatus);
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id", async function (request, response) {
  console.log("delete a todo with ID:", request.params.id);

  const todo = await Todo.findByPk(request.params.id);
  if (todo) {
    try {
      const deletedTodo = await todo.deleteTodo();

      return response.send(deletedTodo ? true : false);
    } catch (error) {
      console.log(error);
      return response.status(422).json(error);
    }
  } else return response.send(false);
});

module.exports = app;
