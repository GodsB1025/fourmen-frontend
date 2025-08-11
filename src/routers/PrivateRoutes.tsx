import React from 'react'
import { Route } from 'react-router-dom'
import DashboardPage from '../pages/private/dashboard/DashboardPage'
import ContractPage from '../pages/private/ContractPage'
import PrivateLobbyPage from '../pages/private/PrivateLobbyPage'
import MeetingRoomPage from '../pages/private/MeetingRoomPage'
import VideoRoomPage from '../pages/private/VideoRoomPage'

export const PrivateRoutes = (
        <>
            <Route path='/dashboard' element={<DashboardPage/>} />
            <Route path='/contract' element={<ContractPage/>} />
            <Route path='/commander' element={<PrivateLobbyPage/>} />
            <Route path='/meetingroom' element={<MeetingRoomPage/>} />
            <Route path='/videoroom' element={<VideoRoomPage/>} />
        </>
    )
