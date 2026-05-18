import migration202405180001 from './202405180001-initialize-schema';
import migration202605180001 from './202605180001-room-access';

export const migrations = [
  migration202405180001,
  migration202605180001,
];
