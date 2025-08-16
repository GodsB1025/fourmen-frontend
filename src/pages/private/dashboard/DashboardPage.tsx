import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import "./Dashboard.css"

type Props = {}

const DashboardPage = (props: Props) => {
  return (
    <div className="dash-wrap">
      <header className="dash-header">
        {/* 가운데 정렬된 탭 */}
        <div className="dash-tabs-center">
          <nav className="dash-tabs" aria-label="Dashboard Tabs">
            <NavLink to="profile" end className="dash-tab">
              프로필
            </NavLink>
            <NavLink to="documents" className="dash-tab">
              문서
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="dash-body">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardPage