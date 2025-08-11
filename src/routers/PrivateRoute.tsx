import React from 'react'
import { Outlet } from 'react-router-dom'

const PrivateRoute = () => {
    // 인증 여부 확인 후 Outlet으로 내보내기

    return (
        <Outlet/>
    )
}

export default PrivateRoute