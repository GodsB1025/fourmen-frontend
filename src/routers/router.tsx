import { lazy, Suspense } from "react";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import Loading from "../components/common/Loading"
import { PATH } from "../stores/paths";

import PrivateRoute from "./PrivateRoute";
import NotFoundPage from "../pages/public/NotFoundPage";

const LobbyPage = lazy(() => import('../pages/public/LobbyPage'));
const SignInPage = lazy(() => import('../pages/public/SignInPage'));
const SignupPage = lazy(() => import('../pages/public/signupPage'));
const DashboardPage = lazy(() => import('../pages/private/dashboard/dashboardPage'));
const ContractPage = lazy(() => import("../pages/private/contractPage"));
const PrivateLobbyPage = lazy(() => import("../pages/private/privateLobbyPage"))
const MeetingRoomPage = lazy(() => import("../pages/private/meetingRoomPage"))
const VideoRoomPage = lazy(() => import("../pages/private/videoRoomPage"))


const PageLoader = () => <Loading/>

const routes: RouteObject[] = [
    {
        // 인증이 필요한 경로
        element: <PrivateRoute />, // 부모에서 인증을 체크
        children: [
            { path: PATH.DASHBOARD, element: <DashboardPage /> },
            { path: PATH.CONTRACT, element: <ContractPage />},
            { path: PATH.COMMANDER, element: <PrivateLobbyPage />},
            { path: PATH.MEETING_ROOM, element: <MeetingRoomPage />},
            { path: PATH.VIDEO_ROOM, element: <VideoRoomPage />},
        ],
    },
    {
        // Public Routes (인증이 필요 없는 경로)
        children: [
            { path: PATH.ROOT, element: <LobbyPage /> },
            { path: PATH.SIGN_IN, element: <SignInPage /> },
            { path: PATH.SIGN_UP, element: <SignupPage /> },
        ],
    },
    {
        // 404 Not Found
        path: '*',
        element: <NotFoundPage />,
    },
]

// Suspense를 적용하여 라우터 객체를 감싸는 함수
const wrapInSuspense = (routes: RouteObject[]): RouteObject[] => {
    return routes.map(route => {
        if (route.element) {
            route.element = <Suspense fallback={<PageLoader />}>{route.element}</Suspense>;
        }
        if (route.children) {
            route.children = wrapInSuspense(route.children);
        }
        return route;
    });
};

export const router = createBrowserRouter(wrapInSuspense(routes))