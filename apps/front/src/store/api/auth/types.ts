export type UserRole = 'voting' | 'watching';

export interface IUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface IUserInfo {
  user: IUser;
}

export interface IRegisterReq {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ILoginData {
  username: string;
  password: string;
}

export interface IChangeUserData {
  username: string;
  password: string;
  role: UserRole;
}

export interface IPasswordInfo {
  isSame: boolean;
}

export interface ICheckPasswordReq {
  password: string;
}