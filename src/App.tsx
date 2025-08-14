import React, { useEffect } from 'react';
import { useAuthStore } from './stores/auths';
import { Outlet, useNavigation } from 'react-router-dom';
import Loading from './components/common/Loading';
import { getMe } from './api/Auth';
import './App.css';

function App() {
  const navigation = useNavigation();
  const { setUser, setAuthChecked, isAuthChecked } = useAuthStore();
  const storeState = useAuthStore((state) => state);

  useEffect(() => {
    // 이 useEffect는 storeState가 변경될 때마다 실행됩니다.
    console.log('Auth Store State Updated:', storeState);
  }, [storeState]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // [핵심] 앱 시작 시, 서버에 사용자 정보를 요청합니다.
        // 브라우저에 유효한 HttpOnly 쿠키가 있다면 성공적으로 사용자 정보를 받아옵니다.
        const user = await getMe();
        setUser(user);
      } catch (error) {
        // getMe()가 401 등의 에러를 반환하면 로그인하지 않은 상태입니다.
        setUser(null);
      } finally {
        // [핵심] API 요청 성공/실패와 관계없이, 인증 확인 절차는 완료되었음을 상태에 기록합니다.
        setAuthChecked(true);
      }
    };

    checkAuthStatus();
  }, []); // 앱이 처음 마운트될 때 한 번만 실행됩니다.

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