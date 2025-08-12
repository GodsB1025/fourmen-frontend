import React from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Loading from './components/common/Loading';
import './App.css';

function App() {
  const navigation = useNavigation();

  return (
    <>
      {/* Outlet 위에 Loading 컴포넌트 랜더링 */}
      {navigation.state === 'loading' && <Loading />}
      
      <Outlet />
    </>
  );
}

export default App;