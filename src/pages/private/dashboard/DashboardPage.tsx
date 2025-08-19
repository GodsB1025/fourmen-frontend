import React from 'react'
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom'
import "./Dashboard.css"
import { PATH } from '../../../types/paths'

type Props = {}

const DashboardPage = (props: Props) => {
  const loc = useLocation();

  return (
    <div className="dash-wrap">
      <header className="dash-header">
        {/* 가운데 정렬된 탭 */}
        <div className="dash-tabs-center">
          <nav className="dash-tabs" aria-label="Dashboard Tabs">
            <NavLink to={PATH.PROFILE} end className="dash-tab">
              프로필
            </NavLink>
            <NavLink to={PATH.COMPANY} end className="dash-tab">
              회사
            </NavLink>
            <NavLink to={PATH.DOCUMENTS} className="dash-tab">
              문서
            </NavLink>
          </nav>
        </div>
      </header>
    

      <main className="dash-body">
        {/* /dashboard로 진입했을 때 자동으로 /dashboard/profile로 이동 */}
        {loc.pathname === PATH.DASHBOARD && (
          <Navigate to={PATH.PROFILE} replace />
        )}
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardPage