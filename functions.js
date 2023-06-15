const { getTodoList, addTodoItem, removeTodoItem } = require('./todo_list');

const availableFunctions = [
  {
    function: getTodoList,
    schema: {
      name: "getTodoList",
      description: "Lists the items on your To-Do list",
      parameters: { type: "object", properties: {} },
    }
  },
  {
    function: addTodoItem,
    schema: {
      name: "addTodoItem",
      description: "Adds an item to your To-Do list",
      parameters: {
        type: "object",
        properties: {
          item: {
            type: "string",
            description: "The item to add to your To-Do list",
          }
        },
      },
    },
  },
  {
    function: removeTodoItem,
    schema: {
      name: "removeTodoItem",
      description: "Removes an item from your To-Do list",
      parameters: {
        type: "object",
        properties: {
          item: {
            type: "string",
            description: "The item to remove from your To-Do list",
          }
        },
      },
    },
  },
];

module.exports = availableFunctions;
