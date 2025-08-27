import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { Outlet, useNavigation } from 'react-router-dom';
import { initCsrf } from './apis/Client';
import Loading from './components/common/Loading';
import './App.css';

function App() {
  initCsrf();
  const navigation = useNavigation();
  // const checkAuth = useAuthStore((state) => state.checkAuth);
  const { checkAuth, isAuthChecked } = useAuthStore()

  // 앱이 처음 마운트될 때 한 번만 실행되며 인증 상태를 불러온다.
  useEffect(() => {
    checkAuth()
  }, []);

  // 인증 상태 확인이 끝나기 전까지 로딩 화면을 보여줍니다.
  if (!isAuthChecked) {
    return <Loading />;
  }

  // 인증 확인이 끝난 후, 페이지 이동 시에도 로딩을 처리하고 자식 페이지를 렌더링합니다.
  return (
    <>
      {navigation.state === 'loading' && <Loading />}
      <Outlet />
    </>
  );
}

export default App;