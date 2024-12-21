/* eslint-disable @typescript-eslint/indent */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { USER_ID } from '../api/todos';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo;
  onDeleteTodo: (todoId: number) => void;
  onUpdateTodo: (newTodo: Todo) => Promise<void>;
  isLoading: boolean;
};

export const TodoItem: React.FC<Props> = props => {
  const { todo, onDeleteTodo, onUpdateTodo, isLoading } = props;

  const [isUpdate, setIsUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState(todo.title);

  const updateRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.FocusEvent<HTMLInputElement, Element>,
  ) => {
    e.preventDefault();

    if (todo.title === updateTitle) {
      setIsUpdate(false);

      return;
    }

    if (!updateTitle) {
      onDeleteTodo(todo.id);
    }

    const updatedTodo: Todo = {
      id: todo.id,
      completed: todo.completed,
      title: updateTitle,
      userId: USER_ID,
    };

    try {
      await onUpdateTodo(updatedTodo);
    } catch (err) {
      throw err;
    } finally {
      setIsUpdate(false);
    }
  };

  useEffect(() => {
    if (updateRef.current) {
      updateRef.current.focus();
    }
  }, [isUpdate]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      event.preventDefault();
      if (event.key === 'Escape') {
        setUpdateTitle(todo.title);
        setIsUpdate(false);
      }
    };

    document.addEventListener('keyup', handleEscape);

    return () => {
      document.removeEventListener('keyup', handleEscape);
    };
  }, [todo.title]);

  const handleComplete = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    onUpdateTodo({ ...todo, completed: !todo.completed });
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleComplete}
        />
      </label>

      {isUpdate ? (
        <form onSubmit={handleUpdate}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={updateTitle}
            onChange={e => setUpdateTitle(e.target.value)}
            ref={updateRef}
            onBlur={handleUpdate}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsUpdate(true)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDeleteTodo(todo.id)}
            disabled={isLoading}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoading || todo.id === 0,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
