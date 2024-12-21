import { Status } from '../types/Status';
import { Todo } from '../types/Todo';

export const getFilteredTodos = (todos: Todo[], status: Status) =>
  todos.filter(todo => {
    if (status === Status.Completed) {
      return todo.completed;
    }

    if (status === Status.Active) {
      return !todo.completed;
    }

    return true;
  });
