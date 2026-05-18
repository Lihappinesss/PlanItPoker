import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cx from 'classnames';

import Shapka from '@src/components/Shapka';
import TaskList from '@src/components/TaskList';
import PlayerPoints from '@components/PlayerPoints';
import TaskVotingBoard from '@components/TaskVotingBoard';

import {
  useGetAllTasksQuery,
} from '@src/store/api/task';
import { useGetUserInfoQuery } from '@src/store/api/auth';

import more from '@src/icons/more.svg';
import { WS_BASE_URL } from '@src/config/env';

import { IUser, ITask, IUserVote } from './types';

import styles from './index.module.scss';


const Plan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const roomId = Number(id);
  const {
    data: tasks,
    refetch: refetchTasks,
    error: tasksError,
  } = useGetAllTasksQuery({ roomId });
  const { data: userData } = useGetUserInfoQuery();
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);

  const [showUnratedTasks, setUnratedTasks] = useState(true);
  const [filteredTasks, updateFilteredTasks] = useState<ITask[] | []>(tasks || []);
  const [users, updateUsers] = useState<IUser[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [usersVotes, updateUsersVotes] = useState<IUserVote[]>([]);
  const [currentSt, updateCurrentSt] = useState<number | null>(null);
  const [roomAccessError, setRoomAccessError] = useState<string | null>(null);
  const currentTask = tasks?.find((task) => !task.storyPoint);
  const taskListRef = useRef<HTMLDivElement | null>(null);
  const userDataRef = useRef(userData);
  const refetchTasksRef = useRef(refetchTasks);

  const { votingUsers, observers } = users.reduce((acc, user) => {

    if (user.role === 'voting') {
      acc.votingUsers.push(user);
    } else if (user.role === 'watching') {
      acc.observers.push(user);
    }

    return acc;
  }, { votingUsers: [] as IUser[], observers: [] as IUser[] });

  userDataRef.current = userData;
  refetchTasksRef.current = refetchTasks;

  const sendSocketCommand = (command: string, payload: unknown) => {
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ command, payload }));
      return;
    }

    console.error('WebSocket connection not open.');
  };

  useEffect(() => {
    const newSocket = new WebSocket(WS_BASE_URL);
    socketRef.current = newSocket;

    newSocket.onopen = () => {
      sendSocketCommand('joinrRoom', {
        login: userDataRef.current?.user?.username,
        roomId,
        role: userDataRef.current?.user?.role,
      });
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.command === 'updateConnectedClients') {
        updateUsers(data.clients);
        updateUsersVotes((prev) => prev.filter((vote) => (
          data.clients.some((client: IUser) => client.login === vote.login)
        )));
        return;
      }

      if (data.command === 'updateVotes') {
        updateUsersVotes(data.votes);
        updateCurrentSt(data.storyPoint);
        return;
      }

      if (data.command === 'error') {
        if (data.message === 'Access to this room is forbidden') {
          setRoomAccessError('You do not have access to this room. Join it with an invite code first.');
          newSocket.close();
        }

        return;
      }

      if (
        data.command === 'tasksAdded' ||
        data.command === 'proceedToNextTask' ||
        data.command === 'tasksRemoved' ||
        data.command === 'taskRemoved' ||
        data.command === 'storyPointUpdated'
      ) {
        if (data.command === 'proceedToNextTask') {
          updateUsersVotes([]);
          updateCurrentSt(null);
        }

        refetchTasksRef.current();
        return;
      }

      if (data.command === 'ownVote' || data.command === 'voteStatus') {
        updateUsersVotes((prev) => {
          const exists = prev.find((userVote) => userVote.login === data.login);

          if (exists) {
            return prev;
          }

          return [
            ...prev,
            { login: data.login, vote: data.vote, roomId: data.roomId },
          ];
        });

        return;
      }

      console.log('Received message from server:', data);
    };

    newSocket.onclose = () => {
      console.log('close');
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
    };

    return () => {
      socketRef.current = null;
      newSocket.close();
    };
  }, [roomId]);

  useEffect(() => {
    const errorStatus = (
      tasksError &&
      typeof tasksError === 'object' &&
      'status' in tasksError
    ) ? tasksError.status : undefined;

    if (errorStatus === 403) {
      setRoomAccessError('You do not have access to this room. Join it with an invite code first.');
      return;
    }

    if (errorStatus === 404) {
      setRoomAccessError('This room does not exist or is no longer available.');
      return;
    }

    if (errorStatus === 400) {
      setRoomAccessError('Invalid room link. Return to the main page and open the room again.');
      return;
    }

    setRoomAccessError(null);
  }, [tasksError]);

  useEffect(() => {
    if (showUnratedTasks) {
      updateFilteredTasks(tasks ? tasks.filter(task => task.storyPoint === 0) : []);
    } else {
      updateFilteredTasks(tasks ? tasks.filter(task => task.storyPoint > 0) : []);
    }
  }, [showUnratedTasks, tasks]);

  const handleCreateTask = (links: string[]) => {
    sendSocketCommand('addTasksRequest', {
      tasks: links,
      login: userData?.user?.username,
    });
  };

  const handleVote = (vote: number) => {
    sendSocketCommand('vote', {
      login: userData?.user?.username,
      roomId,
      vote,
      taskId: currentTask?.id,
    });
  };

  const handleNextTask = () => {
    sendSocketCommand('proceedToNextTask', { roomId });
  };

  const handleRemoveTasks = () => {
    sendSocketCommand('removeTasks', {
      roomId,
      tasksForRemove: filteredTasks,
    });
  };

  const handleRemoveTask = (id: number) => {
    sendSocketCommand('removeTask', {
      roomId,
      taskForRemove: id,
    });
  };

  const handleUpdateStoryPoint = (id: number, vote: number) => {
    sendSocketCommand('updateStoryPoint', {
      roomId,
      taskId: id,
      vote,
    });
  };

  useEffect(() => {
    if (!isTaskListOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        taskListRef.current &&
        !taskListRef.current.contains(e.target as Node)
      ) {
        setIsTaskListOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTaskListOpen]);

  if (roomAccessError) {
    return (
      <div className={styles.plan}>
        <Shapka />

        <main className={styles.main}>
          <section className={styles.statusCard}>
            <h1 className={styles.statusTitle}>Room unavailable</h1>
            <p className={styles.statusText}>{roomAccessError}</p>

            <button
              type='button'
              className={styles.statusAction}
              onClick={() => navigate('/')}
            >
              Back to rooms
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.plan}>
      <Shapka />

      <main className={styles.main}>
        <aside
          className={cx(styles.left, { [styles.open]: isTaskListOpen })}
          ref={taskListRef}
        >
          <TaskList
            tasks={filteredTasks}
            updateFilteredTasks={updateFilteredTasks}
            setUnratedTasks={setUnratedTasks}
            showUnratedTasks={showUnratedTasks}
            handleCreateTask={handleCreateTask}
            handleRemoveTasks={handleRemoveTasks}
            handleRemoveTask={handleRemoveTask}
            handleUpdateStoryPoint={handleUpdateStoryPoint}
          />
        </aside>

        <section className={styles.center}>
          <TaskVotingBoard
            currentTask={currentTask}
            handleVote={handleVote}
          />
        </section>

        <aside className={styles.right}>
          <PlayerPoints
            usersVotes={usersVotes}
            currentSt={currentSt}
            observers={observers}
            votingUsers={votingUsers}
            handleNextTask={handleNextTask}
          />
        </aside>
      </main>

      {isTaskListOpen && (
        <button
          type='button'
          className={styles.overlay}
          aria-label='Close task list'
          onClick={() => setIsTaskListOpen(false)}
        />
      )}

      <button
        type='button'
        className={cx(styles.showTasks, isTaskListOpen && styles.isTaskListOpen)}
        onClick={() => setIsTaskListOpen(true)}
        aria-label='Show task list'
      >
        <img src={more} alt='' aria-hidden='true' />
      </button>
    </div>
  );
};

export default Plan;
