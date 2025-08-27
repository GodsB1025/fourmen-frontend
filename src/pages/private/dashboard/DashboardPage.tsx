import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, } from "react-router-dom";
import "./Dashboard.css";
import { PATH } from "../../../types/paths";
import CustomSwitch from "../../../components/common/CustomSwitch";

type Props = {};

const DashboardPage = (_props: Props) => {
    const loc = useLocation();
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState<string>(loc.pathname.split("/")[2] || "profile");

    const options = [
        { value: "profile", label: "프로필", disabled: false },
        { value: "company", label: "회사", disabled: false },
        { value: "document", label: "문서", disabled: false },
    ];

    const handleChange = (value: string) => {
        setSelectedOption(value);
    };

    useEffect(() => {
        // 현재 경로와 선택된 옵션이 다를 경우에만 navigate 호출
        const currentSubPath = loc.pathname.substring(PATH.DASHBOARD.length + 1);
        if (currentSubPath !== selectedOption) {
            navigate(`${PATH.DASHBOARD}/${selectedOption}`);
        }
    }, [selectedOption, navigate, loc.pathname]);

    // 최초 마운트 시 /dashboard 경로로 접근했을 때 /profile로 리디렉션
    useEffect(() => {
        if (loc.pathname === PATH.DASHBOARD) {
            navigate(`${PATH.DASHBOARD}/profile`, { replace: true });
        }
    }, [loc.pathname, navigate]);

    return (
        <div className="dash-wrap">
            <header className="dash-header">
                <div className="dash-tabs-center">
                    <CustomSwitch options={options} value={selectedOption} onChange={handleChange} />
                </div>
            </header>

            <main className="dash-body">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardPage;
