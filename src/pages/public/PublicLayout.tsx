import Header from '../../components/common/Header'
import { Outlet } from 'react-router-dom'

type Props = {}

const PublicLayout = (_props: Props) => {
    return (
        <div>
            <Header/>
            <Outlet/>
        </div>
    )
}

export default PublicLayout