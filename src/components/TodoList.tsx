import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  tempTodo: Todo | null;
  filteredTodos: Todo[];
  loadingTodos: number[];
  onDeleteTodo: (todoId: number) => void;
  onUpdateTodo: (todoToUpdate: Todo) => Promise<void>;
};

export const TodoList: React.FC<Props> = props => {
  const { filteredTodos, tempTodo, loadingTodos, onDeleteTodo, onUpdateTodo } =
    props;

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLoading={loadingTodos.includes(todo.id)}
          onDeleteTodo={onDeleteTodo}
          onUpdateTodo={onUpdateTodo}
        />
      ))}
      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          isLoading={loadingTodos.includes(tempTodo.id)}
          onDeleteTodo={() => {}}
          onUpdateTodo={onUpdateTodo}
        />
      )}
    </section>
  );
};
