import React from 'react'
import { Route } from 'react-router-dom'
import LobbyPage from '../pages/public/LobbyPage'
import SignupPage from '../pages/public/SignupPage'

export const PublicRoutes = (
    <>
        <Route path='/' element={<LobbyPage/>} />
        <Route path='/signin' element={<SignupPage/>} />
    </>
)
