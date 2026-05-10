import { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Plan from '@pages/plan';
import MainPage from '@pages/mainPage';
import SignIn from '@src/pages/signIn';
import SignUp from '@pages/signUp';
import NotFound from '@pages/notFound';

import { selectUser, setUser } from './store/authSlice';
import { useGetUserInfoQuery } from '@src/store/api/auth';

const App = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = Boolean(user);

  const { data } = useGetUserInfoQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch]);

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/" element={<MainPage />} />
            <Route path="/plan/:id" element={<Plan />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;