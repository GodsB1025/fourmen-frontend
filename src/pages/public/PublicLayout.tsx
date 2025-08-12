import React from 'react'
import Header from '../../components/common/Header'
import { Outlet } from 'react-router-dom'

type Props = {}

const PublicLayout = (props: Props) => {
    return (
        <div>
            <Header/>
            <Outlet/>
        </div>
    )
}

export default PublicLayout