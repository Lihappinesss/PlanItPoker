import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import cx from 'classnames';

import Shapka from '@src/components/Shapka';
import TaskList from '@src/components/TaskList';
import PlayerPoints from '@components/PlayerPoints';
import TaskVotingBoard from '@components/TaskVotingBoard';

import {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
} from '@src/store/api/task';
import { useGetUserInfoQuery } from '@src/store/api/auth';

import more from '@src/icons/more.svg';

import { IUser, ITask, IUserVote } from './types';

import styles from './index.module.scss';


const Plan = () => {
  const { id } = useParams();
  const roomId = Number(id);
  const [createTask] = useCreateTaskMutation();
  const { data: tasks, refetch: refetchTasks } = useGetAllTasksQuery({ roomId });
  const [updateTask] = useUpdateTaskMutation();
  const { data: userData } = useGetUserInfoQuery();
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);

  const [showUnratedTasks, setUnratedTasks] = useState(true);
  const [filteredTasks, updateFilteredTasks] = useState<ITask[] | []>(tasks || []);
  const [users, updateUsers] = useState<IUser[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [usersVotes, updateUsersVotes] = useState<IUserVote[]>([]);
  const [currentSt, updateCurrentSt] = useState<number | null>(null);
  const currentTask = tasks?.find(task => !task.storyPoint);
  const taskListRef = useRef<HTMLDivElement | null>(null);

  const { votingUsers, observers } = users.reduce((acc, user) => {

    if (user.role === 'voting') {
      acc.votingUsers.push(user);
    } else if (user.role === 'watching') {
      acc.observers.push(user);
    }

    return acc;
  }, { votingUsers: [] as IUser[], observers: [] as IUser[] });

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3000/plan/');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (showUnratedTasks) {
      updateFilteredTasks(tasks ? tasks.filter(task => task.storyPoint === 0) : []);
    } else {
      updateFilteredTasks(tasks ? tasks.filter(task => task.storyPoint > 0) : []);
    }
  }, [showUnratedTasks, tasks]);

  useEffect(() => {
    if (!socket) return;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        command: 'joinrRoom',
        payload: {
          login: userData?.user?.username,
          roomId,
          role: userData?.user?.role
        },
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.command === 'updateConnectedClients') {
        const connectedClientsList: IUser[] = data.clients;
        updateUsers(connectedClientsList);
      } else if (data.command === 'updateVotes') {
        const { votes, storyPoint } = data;
        updateUsersVotes(votes);
        updateCurrentSt(storyPoint);
      } else if (data.command === 'tasksAdded') {
        refetchTasks();
      } else if (data.command === 'proceedToNextTask') {
        updateUsersVotes([]);
        updateCurrentSt(null);
        refetchTasks();
      } else if (data.command === 'ownVote') {
        const { vote, login, roomId } = data;
        const userVote = {
          login,
          vote,
          roomId,
        };
        updateUsersVotes([...usersVotes, userVote]);
      } else if (data.command === 'tasksRemoved') {
        refetchTasks();
      } else if (data.command === 'taskRemoved') {
        refetchTasks();
      } else if (data.command === 'storyPointUpdated') {
        refetchTasks();
      } else if (data.command === 'voteStatus') {
        updateUsersVotes((prev) => {
          const exists = prev.find(u => u.login === data.login);
          if (exists) return prev;
          return [
            ...prev,
            { login: data.login, vote: data.vote, roomId: data.roomId }
          ];
        });

      }  else {
        console.log('Received message from server:', data);
      }
    };

    socket.onclose = () => {
      console.log('close');
    };

    socket.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
    };
  }, [roomId, userData, socket, filteredTasks, updateTask, refetchTasks, createTask, tasks, usersVotes]);

  const handleCreateTask = useCallback((links: string[]) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        command: 'addTasksRequest',
        payload: { tasks: links, login: userData?.user?.username, }
      }));
    } else {
      console.error('WebSocket connection not open.');
    }
  }, [socket, userData]);

  const handleVote = (vote: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        command: 'vote',
        payload: {
          login: userData?.user?.username,
          roomId,
          vote,
          taskId: currentTask?.id
        }
      }));
    } else {
      console.error('WebSocket connection not open.');
    }
  };

  const handleNextTask = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          command: 'proceedToNextTask',
          payload: { roomId },
        })
      );
    }
  }, [socket, roomId]);

  const handleRemoveTasks = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        command: 'removeTasks',
        payload: { roomId, tasksForRemove: filteredTasks }
      }));
    } else {
      console.error('WebSocket connection not open.');
    }
  }, [filteredTasks, roomId, socket]);

  const handleRemoveTask = useCallback((id: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        command: 'removeTask',
        payload: { roomId, taskForRemove: id}
      }));
    } else {
      console.error('WebSocket connection not open.');
    }
  }, [roomId, socket]);

  const handleUpdateStoryPoint = useCallback((id: number, vote: number) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        command: 'updateStoryPoint',
        payload: {
          roomId,
          taskId: id,
          vote,
        }
      }));
    } else {
      console.error('WebSocket connection not open.');
    }
  }, [roomId, socket]);

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

  return (
    <div className={styles.plan}>
      <Shapka />

      <main className={styles.main}>
        <div className={cx(styles.left, { [styles.open]: isTaskListOpen })} ref={taskListRef}>
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
        </div>

        <div className={styles.center}>
          <TaskVotingBoard currentTask={currentTask} handleVote={handleVote} />
        </div>

        <div className={styles.right}>
          <PlayerPoints
            usersVotes={usersVotes}
            currentSt={currentSt}
            observers={observers}
            votingUsers={votingUsers}
            handleNextTask={handleNextTask}
          />
        </div>
      </main>

      {isTaskListOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsTaskListOpen(false)}
        />
      )}

      <button
        className={cx(styles.showTasks, isTaskListOpen && styles._isTaskListOpen)}
        onClick={() => setIsTaskListOpen(true)}
      >
        <img src={more} alt='show list tasks' />
      </button>
    </div>
  );
};

export default Plan;