export interface IRegisterReq {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface ILoginData {
  username: string;
  password: string;
}

export interface IUserInfo {
  isAuth: boolean;
  user: {
    id: number;
    username: string;
    email: string;
    role: string,
  }
}

export interface IChangeUserData {
  username: string;
  password: string;
  id: number;
}

export interface IPasswordInfo {
  isSame: boolean;
}
