import crypto from 'crypto';

import Room from '../models/room';
import RoomMember from '../models/roomMember';

export const generateInviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();

export const createUniqueInviteCode = async () => {
  let inviteCode = generateInviteCode();
  let existingRoom = await Room.findOne({ where: { inviteCode } });

  while (existingRoom) {
    inviteCode = generateInviteCode();
    existingRoom = await Room.findOne({ where: { inviteCode } });
  }

  return inviteCode;
};

export const hasRoomAccess = async (roomId: number, userId: number) => {
  const membership = await RoomMember.findOne({
    where: {
      roomId,
      userId,
    },
  });

  return Boolean(membership);
};
