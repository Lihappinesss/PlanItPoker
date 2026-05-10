import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';

import User from '../models/user';

interface SafeUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

type RequestWithSessionUser = Request & {
  session: Request['session'] & {
    user?: {
      id: number;
    };
  };
};

const getSafeUser = (user: {
  id: number;
  username: string;
  email: string;
  role: string;
}): SafeUser => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
});

export const register = async (req: RequestWithSessionUser, res: Response): Promise<void> => {
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
      id: newUser.id,
    };

    await req.session.save();

    res.status(200).json({
      message: 'Registration and authentication successful',
      user: getSafeUser(newUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const login = async (req: RequestWithSessionUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = {
        id: user.id,
      };

      await req.session.save();

      res.status(200).json({
        message: 'Authentication successful',
        user: getSafeUser(user),
      });

      return;
    }

    res.status(401).json({
      message: 'Invalid credentials',
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    next(error);
  }
};

export const checkAuth = async (req: RequestWithSessionUser, res: Response): Promise<void> => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      res.status(401).json({
        user: null,
      });

      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      delete req.session.user;
      await req.session.save();

      res.status(401).json({
        user: null,
      });

      return;
    }

    res.status(200).json({
      user: getSafeUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const changeData = async (req: RequestWithSessionUser, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { username, password, role } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден',
      });

      return;
    }

    if (username) {
      user.username = username;
    }

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    if (role) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({
      message: 'Данные пользователя успешно обновлены',
      user: getSafeUser(user),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

export const logout = async (req: RequestWithSessionUser, res: Response): Promise<void> => {
  try {
    if (req.session.user) {
      delete req.session.user;
      await req.session.save();
    }

    res.status(200).json({
      message: 'Сессия удалена',
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const checkPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
        isSame: true,
      });

      return;
    }

    res.status(200).json({
      isSame: false,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
