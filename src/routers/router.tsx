// UPDATE: src/routers/router.tsx
import { lazy, Suspense } from "react";
import { createHashRouter, type RouteObject } from "react-router-dom"; // ← 여기만 변경
import Loading from "../components/common/Loading";
import { PATH } from "../types/paths";

import PrivateRoute from "./PrivateRoute";
import NotFoundPage from "../pages/public/NotFoundPage";
import PublicLayout from "../pages/public/PublicLayout";
import App from "../App";
import PrivateLayout from "../pages/private/PrivateLayout";
import ProfilePage from "../pages/private/dashboard/ProfilePage";
import CompanyPage from "../pages/private/dashboard/CompanyPage";
import DocumentsPage from "../pages/private/dashboard/DocumentsPage";

const LobbyPage = lazy(() => import("../pages/public/LobbyPage"));
const SignInPage = lazy(() => import("../pages/public/SignInPage"));
const SignupPage = lazy(() => import("../pages/public/SignupPage"));
const DashboardPage = lazy(() => import("../pages/private/dashboard/DashboardPage"));
const ContractPage = lazy(() => import("../pages/private/ContractPage"));
const PrivateLobbyPage = lazy(() => import("../pages/private/PrivateLobbyPage"));
const VideoRoomPage = lazy(() => import("../pages/private/VideoRoomPage"));
const MessengerPage = lazy(() => import("../pages/private/MessengerPage"));

const PageLoader = () => <Loading />;

const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        // 인증이 필요한 경로
        element: <PrivateRoute />, // 부모에서 인증을 체크
        children: [
          {
            element: <PrivateLayout />,
            children: [
              {
                path: PATH.DASHBOARD,
                element: <DashboardPage />,
                children: [
                  { path: PATH.PROFILE, element: <ProfilePage /> },
                  { path: PATH.COMPANY, element: <CompanyPage /> },
                  { path: PATH.DOCUMENTS, element: <DocumentsPage /> },
                ],
              },
              { path: PATH.CONTRACT, element: <ContractPage /> },
              { path: PATH.COMMANDER, element: <PrivateLobbyPage /> },
              { path: PATH.VIDEO_ROOM, element: <VideoRoomPage /> },
              { path: PATH.MESSENGER, element: <MessengerPage /> },
            ],
          },
        ],
      },
      {
        // Public Routes (인증이 필요 없는 경로)
        element: <PublicLayout />,
        children: [
          { path: PATH.ROOT, element: <LobbyPage /> },
          { path: PATH.SIGN_IN, element: <SignInPage /> },
          { path: PATH.SIGN_UP, element: <SignupPage /> },
        ],
      },
      {
        // 404 Not Found
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

// Suspense를 적용하여 라우터 객체를 감싸는 함수
const wrapInSuspense = (routes: RouteObject[]): RouteObject[] => {
  return routes.map((route) => {
    if (route.element) {
      route.element = <Suspense fallback={<PageLoader />}>{route.element}</Suspense>;
    }
    if (route.children) {
      route.children = wrapInSuspense(route.children);
    }
    return route;
  });
};

export const router = createHashRouter(wrapInSuspense(routes)); // ← 여기만 변경
