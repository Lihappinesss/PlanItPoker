import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { SessionData } from 'express-session';

import User from '../models/user';

interface AuthRequest extends Request {
  session?: {
    user?: {
      isAuth?: boolean;
      username: string;
      password: string;
      role: string;
    };
  };
}

interface ChangeRequest extends Request {
  session?: {
    user?: {
      username: string;
      password: string;
      role: string;
    };
  };
}

// Todo добавить возврат ошибок
// проверить код на безопасность
interface ExtendedRequest extends Request {
  session: SessionData & { user?: { userId: string; username: string; email: string; isAuth: boolean } };
}

export const register = async (req: ExtendedRequest, res: Response): Promise<void>  => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    req.session.user = {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isAuth: true,
    };

    await req.session.save();

    res.status(200).json({ message: 'Registration and authentication successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const login = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAuth: true,
        role: user.role,
      };
      await req.session.save();
      res.status(200).json({ message: 'Authentication successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    next(error);
  }
};

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAuthenticated = req.session?.user?.isAuth;
    const user = req.session?.user;

    if (isAuthenticated) {
      res.status(200).json({ isAuth: true, user });
    } else {
      res.status(401).json({ isAuth: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const changeData  = async (req: ChangeRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, password, role } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (username) {
      user.username = username;
    }
    if (password) {
      user.password = password;
    }
    if (role) {
      user.role = role;
    }

    await user.save();

    return res.status(200).json({ message: 'Данные пользователя успешно обновлены', user });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

export const logout = async (req, res: Response) => {
  try {
    if (req.session.user) {
      delete req.session.user;
      await req.session.save();

      return res.status(200).json({ message: 'Сессия удалена'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const checkPassword = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ isSame: true });
    } else {
      res.status(200).json({ isSame: false });
    }
  } catch(error) {
    res.status(500).send('Internal Server Error');
  }
};