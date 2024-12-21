import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { ErrorMessage } from '../types/ErrorMessage';

type Props = {
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  error: ErrorMessage;
  isToogleAll: boolean | null;
  isInputDisablet: boolean;
  isDeletedTodos: number[];
  onAddTodo: (title: string) => Promise<void>;
  onToggleAll: () => void;
  setErrorMessage: (error: ErrorMessage) => void;
};

export const TodoHeader: React.FC<Props> = props => {
  const {
    inputRef,
    error,
    isToogleAll,
    isInputDisablet,
    isDeletedTodos,
    onAddTodo,
    onToggleAll,
    setErrorMessage,
  } = props;

  const [title, setTitle] = useState('');

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, isInputDisablet, isDeletedTodos]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (error !== ErrorMessage.Default) {
      setErrorMessage(ErrorMessage.Default);
    }

    if (!title.trim()) {
      setErrorMessage(ErrorMessage.EmptyTitle);

      return;
    }

    try {
      await onAddTodo(title.trim());
      setTitle('');
    } catch (err) {}
  };

  return (
    <header className="todoapp__header">
      {isToogleAll !== null && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isToogleAll })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={title}
          onChange={event => setTitle(event.target.value)}
          disabled={isInputDisablet}
        />
      </form>
    </header>
  );
};
