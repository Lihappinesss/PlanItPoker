import { useState } from 'react';

import close from 'src/icons/close.png';

import styles from './index.module.scss';

interface CreateRoomProps {
  handleClose: () => void;
  handleCreateRoom: (title: string) => void;
}

const CreateRoom = ({ handleClose, handleCreateRoom }: CreateRoomProps) => {
  const [title, setTitle] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    handleCreateRoom(trimmedTitle);
  };

  return (
    <form className={styles.create} onSubmit={handleSubmit}>
      <button
        type='button'
        className={styles.close}
        onClick={handleClose}
        aria-label='Close modal'
      >
        <img src={close} alt='' aria-hidden='true' />
      </button>

      <div className={styles.label}>New room</div>

      <h2 className={styles.title}>Create room</h2>

      <p className={styles.description}>
        Give your room a short and clear name so your team can quickly find the right session.
      </p>

      <label className={styles.field}>
        <span className={styles.fieldLabel}>Room name</span>

        <input
          value={title}
          onChange={handleChange}
          name='roomName'
          className={styles.input}
          placeholder='e.g. Backend planning'
          type='text'
          autoFocus
        />
      </label>

      <div className={styles.actions}>
        <button
          type='button'
          className={styles.cancelButton}
          onClick={handleClose}
        >
          Cancel
        </button>

        <button
          type='submit'
          className={styles.createButton}
          disabled={!title.trim()}
        >
          Create room
        </button>
      </div>
    </form>
  );
};

export default CreateRoom;