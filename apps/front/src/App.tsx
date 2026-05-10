import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import Plan from '@pages/plan';
import MainPage from '@pages/mainPage';
import SignIn from '@src/pages/signIn';
import SignUp from '@pages/signUp';
import NotFound from '@pages/notFound';

import { selectIsAuth } from './store/authSlice';
import { useGetUserInfoQuery } from '@src/store/api/auth';

const App: React.FC = () => {
  const isAuthenticated = useSelector(selectIsAuth);

  const { isLoading, isFetching } = useGetUserInfoQuery();

  const isAuthChecking = isLoading || isFetching;

  if (isAuthChecking) {
    return null;
  }

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