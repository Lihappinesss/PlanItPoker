import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { UniqueConstraintError } from 'sequelize';

import User from '../models/user';

const {
  NODE_ENV,
  SESSION_COOKIE_NAME = 'connect.sid',
  SESSION_COOKIE_DOMAIN,
  SESSION_COOKIE_SAME_SITE,
  SESSION_COOKIE_SECURE,
} = process.env;

const isProduction = NODE_ENV === 'production';

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
};

const normalizeSameSite = (
  value: string | undefined
): 'lax' | 'strict' | 'none' => {
  if (value === 'strict' || value === 'none' || value === 'lax') {
    return value;
  }

  return isProduction ? 'none' : 'lax';
};

const cookieSecure = parseBoolean(SESSION_COOKIE_SECURE, isProduction);
const cookieSameSite = normalizeSameSite(SESSION_COOKIE_SAME_SITE);

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

    if (!username || !email || !password || !role) {
      res.status(400).json({
        message: 'Username, email, password and role are required',
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({
        message: 'User with this username or email already exists',
      });

      return;
    }

    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const login = async (req: RequestWithSessionUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        message: 'Username and password are required',
      });

      return;
    }

    const user = await User.findOne({ where: { username } });

    if (user && await bcrypt.compare(password, user.password)) {
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
    return next(error);
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

export const changeData = async (
  req: RequestWithSessionUser,
  res: Response
): Promise<void> => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });

      return;
    }

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
      user.password = await bcrypt.hash(password, 10);
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
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({
        message: 'User with this username already exists',
      });

      return;
    }

    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

export const logout = (req: Request, res: Response): void => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);

      res.status(500).json({
        message: 'Logout error',
      });

      return;
    }

    res.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      ...(SESSION_COOKIE_DOMAIN ? { domain: SESSION_COOKIE_DOMAIN } : {}),
    });

    res.status(200).json({
      message: 'Сессия удалена',
    });
  });
};

export const checkPassword = async (req: RequestWithSessionUser, res: Response): Promise<void> => {
  try {
    const userId = req.session.user?.id;

    if (!userId) {
      res.status(401).json({
        message: 'Unauthorized',
      });

      return;
    }

    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        message: 'Password is required',
      });

      return;
    }

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({
        message: 'Пользователь не найден',
      });

      return;
    }

    const isSame = await bcrypt.compare(password, user.password);

    res.status(200).json({
      isSame,
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};
