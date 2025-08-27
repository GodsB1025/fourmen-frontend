import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import "./Dashboard.css"
import { PATH } from '../../../types/paths'
import CustomSwitch from '../../../components/common/CustomSwitch'

type Props = {}

const DashboardPage = (_props: Props) => {
  const loc = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>(PATH.PROFILE);

  const options = [
    { value: PATH.PROFILE, label: "프로필", disabled: false },
    { value: PATH.COMPANY, label: "회사", disabled: false },
    { value: PATH.DOCUMENTS, label: "문서", disabled: false },
  ];

  const handleChange = ( value: string ) => {
    setSelectedOption(value)
  }

  useEffect(() => {
    if(loc.pathname === PATH.DASHBOARD) {
      navigate(PATH.PROFILE, { replace: true })
      return
    }
    navigate(selectedOption)
  }, [selectedOption])

  return (
    <div className="dash-wrap">
      <header className="dash-header">
        {/* 가운데 정렬된 탭 */}
        <div className="dash-tabs-center">
          <CustomSwitch 
            options={options}
            value={selectedOption}
            onChange={handleChange}
          />
        </div>
      </header>
    

      <main className="dash-body">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardPage