const todoList = [];

function getTodoList() {
  if (todoList.length === 0) {
    return "You have no To-Do's!";
  }

  return `You have the following To-Do's:\n- ${todoList.join('\n- ')}`;
}

function addTodoItem({ item }) {
  todoList.push(item);
  return `Added "${item}" to your To-Do list!`;
}

function removeTodoItem({ item }) {
  const index = todoList.indexOf(item);
  if (index > -1) {
    todoList.splice(index, 1);
    return `Removed "${item}" from your To-Do list!`;
  } else {
    return `Could not find "${item}" in your To-Do list!`;
  }
}

module.exports = {
  getTodoList: getTodoList,
  addTodoItem: addTodoItem,
  removeTodoItem: removeTodoItem,
};
