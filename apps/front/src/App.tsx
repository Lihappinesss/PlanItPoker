import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import Plan from '@pages/plan';
import MainPage from '@pages/mainPage';
import SignIn from '@src/pages/signIn';
import SignUp from '@pages/signUp';
import NotFound from '@pages/notFound';

import { selectIsAuth } from './store/authSlice';
import { useGetUserInfoQuery } from '@src/store/api/auth';

import { setIsAuth } from '@src/store/authSlice';


const App: React.FC =  () => {
  const isAuthenticated = useSelector(selectIsAuth);
  const { isError, data } = useGetUserInfoQuery();
  const dispatch = useDispatch();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    if (!isError && data) {
      dispatch(setIsAuth(true));
    }
  }, [isError, data, dispatch]);

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePathChange);

    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          <>
            <Route path="/plan/:id" element={<Plan />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<MainPage />} />
          </>
        ) : (
          <>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
        <Route path="/login" element={!isAuthenticated ? <SignIn /> : <Navigate to={currentPath} />} />
        <Route path="/register" element={<SignUp />} />
      </Routes>
    </Router>
  );
};

export default App;