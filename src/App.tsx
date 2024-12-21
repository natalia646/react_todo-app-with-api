/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import * as clientTodo from './api/todos';
import { getFilteredTodos } from './utils/getFilteredTodos';

import { ErrorMessage } from './types/ErrorMessage';
import { Todo } from './types/Todo';
import { Status } from './types/Status';

import { TodoHeader } from './components/TodoHeader';
import { TodoFooter } from './components/TodoFooter';
import { TodoItem } from './components/TodoItem';
import { ErrorNotification } from './components/ErrorNotification';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeStatus, setActiveStatus] = useState(Status.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoadingTodos, setIsLoadingTodos] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage>(
    ErrorMessage.Default,
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredTodos = getFilteredTodos(todos, activeStatus);
  const notCompletedTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  const isToogleAll =
    todos.length !== 0 ? completedTodos.length === todos.length : false;

  const onAddTodo = async (title: string) => {
    setTempTodo({
      id: 0,
      title,
      userId: clientTodo.USER_ID,
      completed: false,
    });

    const newTodo: Omit<Todo, 'id'> = {
      title,
      userId: clientTodo.USER_ID,
      completed: false,
    };

    try {
      const todo = await clientTodo.createTodos(newTodo);

      setTodos(currentTodos => [...currentTodos, todo]);
    } catch (error) {
      setErrorMessage(ErrorMessage.UnableToAdd);
      throw error;
    } finally {
      setTempTodo(null);
    }
  };

  const onUpdateTodo = async (todoToUpdate: Todo) => {
    setIsLoadingTodos(prevTodos => [...prevTodos, todoToUpdate.id]);

    try {
      const updatedTodo = await clientTodo.updateTodo(todoToUpdate);

      setTodos(currentTodos => {
        const newTodos = [...currentTodos];
        const index = newTodos.findIndex(todo => todo.id === updatedTodo.id);

        newTodos.splice(index, 1, updatedTodo);

        return newTodos;
      });
    } catch (error) {
      setErrorMessage(ErrorMessage.UnableToUpdate);
      throw error;
    } finally {
      setIsLoadingTodos(prevTodos => prevTodos.filter(id => todoToUpdate.id !== id));
    }
  };

  const onDeleteTodo = (todoId: number) => {
    setIsLoadingTodos(prevTodos => [...prevTodos, todoId]);

    clientTodo
      .deleteTodo(todoId)
      .then(() =>
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        ),
      )
      .catch(error => {
        setErrorMessage(ErrorMessage.UnableToDelete);
        throw error;
      })
      .finally(() =>
        setIsLoadingTodos(prevTodos => prevTodos.filter(id => todoId !== id)),
      );
  };

  const onDeleteAllCompleted = () => {
    completedTodos.forEach(todo => onDeleteTodo(todo.id));
  };

  const onToggleAll = () => {
    if (todos.every(todo => todo.completed)) {
      todos.forEach(todo => onUpdateTodo({ ...todo, completed: false }));
    } else {
      todos.forEach(todo => onUpdateTodo({ ...todo, completed: true }));
    }
  };

  useEffect(() => {
    clientTodo
      .getTodos()
      .then(data => setTodos(data))
      .catch(error => {
        setErrorMessage(ErrorMessage.UnableToLoad);
        throw error;
      });
  }, []);

  if (!clientTodo.USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoHeader
          inputRef={inputRef}
          error={errorMessage}
          isToogleAll={isToogleAll}
          isInputDisablet={!!tempTodo}
          isDeletedTodos={isLoadingTodos}
          onAddTodo={onAddTodo}
          onToggleAll={onToggleAll}
          setErrorMessage={setErrorMessage}
        />

        <section className="todoapp__main" data-cy="TodoList">
          {filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDeleteTodo={onDeleteTodo}
              onUpdateTodo={onUpdateTodo}
              isLoading={isLoadingTodos.includes(todo.id)}
            />
          ))}
          {tempTodo && (
            <TodoItem
              todo={tempTodo}
              onDeleteTodo={onDeleteTodo}
              onUpdateTodo={onUpdateTodo}
              isLoading={isLoadingTodos.includes(tempTodo.id)}
            />
          )}
        </section>

        {!!todos.length && (
          <TodoFooter
            activeStatus={activeStatus}
            completedTodos={completedTodos.length}
            notCompletedTodos={notCompletedTodos.length}
            onDeleteAllCompleted={onDeleteAllCompleted}
            setActiveStatus={setActiveStatus}
          />
        )}
      </div>

      <ErrorNotification
        error={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </div>
  );
};
