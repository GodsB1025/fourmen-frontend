import React from 'react'
import Sidebar from '../../components/common/Sidebar'
import { Outlet } from 'react-router-dom'
type Props = {}

const PrivateLayout = (props: Props) => {
    const dummyUser = {
    name: "홍길동",
    email: "hong@example.com",
  };
    return (
        <div>
            <Sidebar 
                userName={dummyUser.name}
                userEmail={dummyUser.email}
                onLogout={() => console.log('로그아웃 클릭됨')}
                onNavigate={(path) => console.log(`이동: ${path}`)}
                activeKey="dashboard"/>
            <Outlet />
        </div>
    )
}

export default PrivateLayout