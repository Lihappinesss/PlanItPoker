import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Plan from '@pages/plan';
import HomePage from '@pages/homePage';
import SignIn from '@src/pages/signIn';
import SignUp from '@pages/signUp';
import Profile from '@pages/profile';
import NotFound from '@pages/notFound';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/' element={<HomePage />} />
        <Route path='/plan' element={<Plan />} />
        <Route path='/*' element={<NotFound />} />
      </Routes>
    </Router>
  )
}
export default App;
