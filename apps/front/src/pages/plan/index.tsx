import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Shapka from '@src/components/Shapka';
import TaskList from '@src/components/TaskList';
import PlayerPoints from '@components/PlayerPoints';
import TaskVotingBoard from '@components/TaskVotingBoard';

import {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useDeleteTasksMutation,
} from '@src/store/api/task';
import { useGetUserInfoQuery } from '@src/store/api/auth';

import { IUser, ITask, IUserVote } from './types';

import styles from './index.module.scss';


const Plan = () => {
  const { id } = useParams();
  const roomId = Number(id);
  const [createTask] = useCreateTaskMutation();
  const [deleteTasks] = useDeleteTasksMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: tasks, refetch: refetchTasks } = useGetAllTasksQuery({ roomId });
  const [updateTask] = useUpdateTaskMutation();
  const { data: userData } = useGetUserInfoQuery();

  const [showUnratedTasks, setUnratedTasks] = useState(true);
  const [filteredTasks, updateFilteredTasks] = useState<ITask[] | undefined>(tasks);
  const [users, updateUsers] = useState<IUser[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [usersVotes, updateUsersVotes] = useState<IUserVote[]>([]);
  const [currentSt, updateCurrentSt] = useState<number | null>(null);
  const currentTask = tasks?.find(task => !task.storyPoint);

  const { votingUsers, observers } = users.reduce((acc, user) => {
    if (user.role === 'voting') {
      acc.votingUsers.push(user);
    } else if (user.role === 'observers') {
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
      updateFilteredTasks(tasks?.filter(task => task.storyPoint === 0));
    } else {
      updateFilteredTasks(tasks?.filter(task => task.storyPoint > 0));
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
        refetchTasks();
      } else if (data.command === 'tasksAdded') {
        refetchTasks();
      } else if (data.command === 'proceedToNextTask') {
        refetchTasks();
        updateUsersVotes([]);
        updateCurrentSt(null);
      } else {
        console.log('Received message from server:', data);
      }
    };

    socket.onclose = () => {
      console.log('close');
    };

    socket.onerror = (error) => {
      console.error('WebSocket encountered an error:', error);
    };
  }, [roomId, userData, socket, filteredTasks, updateTask, refetchTasks, createTask, tasks]);

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
          payload: {
            roomId,
          },
        })
      );
    }
  }, [socket, roomId]);

  /**
    * Возможность переставить задачу
    * в конец списка, вперед и удаление
  */
  const handleMoveTask = useCallback((command: string, id: number) => {
    if (filteredTasks) {
      const { foundTask, updatedFilteredTasks } = filteredTasks.reduce((acc, task) => {
        if (task.id === id) {
          acc.foundTask = task;
        } else {
          acc.updatedFilteredTasks.push(task);
        }
        return acc;
      }, { foundTask: null as ITask | null, updatedFilteredTasks: [] as ITask[] });

      if (foundTask) {
        if (command === 'top') {
          updateFilteredTasks([foundTask, ...updatedFilteredTasks]);
        } else if (command === 'bottom') {
          updateFilteredTasks([...updatedFilteredTasks, foundTask]);
        } else if (command === 'remove') {
          deleteTask({ id }).then(() => {
            refetchTasks();
          });
        }
      }
    }
  }, [filteredTasks, deleteTask, refetchTasks]);

  const handleRemoveTasks = useCallback(() => {
    deleteTasks({ id: roomId}).then(() => {
      refetchTasks();
    });
  }, [deleteTasks, roomId, refetchTasks]);

  return (
    <div className={styles.plan}>
      <Shapka />
      <main className={styles.main}>
        <TaskList
          tasks={filteredTasks}
          setUnratedTasks={setUnratedTasks}
          showUnratedTasks={showUnratedTasks}
          handleMoveTask={handleMoveTask}
          handleCreateTask={handleCreateTask}
          handleRemoveTasks={handleRemoveTasks}
        />

        <TaskVotingBoard currentTask={currentTask} handleVote={handleVote} />

        <PlayerPoints
          usersVotes={usersVotes}
          currentSt={currentSt}
          observers={observers}
          votingUsers={votingUsers}
          handleNextTask={handleNextTask}
        />
      </main>
    </div>
  );
};

export default Plan;