import type {RouteObject} from "react-router-dom";
import {MainLayout} from "../layouts/MainLayout.tsx";
import {AdminLayout} from "../layouts/AdminLayout.tsx";
import {Home} from "../pages/Home/Home.tsx";
import {LoginPage} from "../pages/Login/LoginPage.tsx";
import {RegisterPage} from "../pages/Register/RegisterPage.tsx";
import ResetPasswordPage from "../pages/ResetPassword/ResetPasswordPage.tsx";
import {CategoryPage} from "../pages/Category/CategoryPage.tsx";
import {MangaDetailPage} from "../pages/MangaDetail/MangaDetailPage.tsx";
import {ReadingMangaPage} from "../pages/ReadingManga/ReadingMangaPage.tsx";
import {UserProfile} from "../pages/UserProfile/UserProfile.tsx";
import {AdminDashboard} from "../pages/Admin/Dashboard/AdminDashboard.tsx";
import {UserManagement} from "../pages/Admin/UserManagement/UserManagement.tsx";
import {AuthorRequests} from "../pages/Admin/AuthorRequests/AuthorRequests.tsx";
import {ReadingHistory} from "../pages/ReadingHistory/ReadingHistory.tsx";
import {FollowedManga} from "../pages/FollowedManga/FollowedManga.tsx";
import {RouteError} from "./RouteError.tsx";

import { AuthorMangaList } from "../pages/AuthorDashboard/AuthorMangaList.tsx";
import { AuthorMangaCreate } from "../pages/AuthorDashboard/AuthorMangaCreate.tsx";
import { AuthorMangaEdit } from "../pages/AuthorDashboard/AuthorMangaEdit.tsx";
import { AuthorChapterManage } from "../pages/AuthorDashboard/AuthorChapterManage.tsx";
import { AuthorChapterUpload } from "../pages/AuthorDashboard/AuthorChapterUpload.tsx";
import { AuthorStatistics } from "../pages/AuthorDashboard/AuthorStatistics.tsx";

export const appRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <RouteError />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "category",
                element: <CategoryPage />
            },
            {
                path: "manga/:slug",
                element: <MangaDetailPage />
            },
            {
                path: "manga/:slug/c/:chapterNumber",
                element: <ReadingMangaPage />
            },
            {
                path: "profile",
                element: <UserProfile />
            },
            {
                path: "profile/:tab",
                element: <UserProfile />
            },
            {
                path: "reading-history",
                element: <ReadingHistory />
            },
            {
                path: "followed-manga",
                element: <FollowedManga />
            }
        ]
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        errorElement: <RouteError />,
        children: [
            {
                index: true,
                element: <AdminDashboard />
            },
            {
                path: "author/manga",
                element: <AuthorMangaList />
            },
            {
                path: "author/manga/create",
                element: <AuthorMangaCreate />
            },
            {
                path: "author/manga/:mangaId/edit",
                element: <AuthorMangaEdit />
            },
            {
                path: "author/manga/:mangaId/chapters",
                element: <AuthorChapterManage />
            },
            {
                path: "author/manga/:mangaId/chapters/:chapterId/upload",
                element: <AuthorChapterUpload />
            },
            {
                path: "author/statistics",
                element: <AuthorStatistics />
            },
            {
                path: "dashboard",
                element: <AdminDashboard />
            },
            {
                path: "users",
                element: <UserManagement />
            },
            {
                path: "author-requests",
                element: <AuthorRequests />
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage />,
        errorElement: <RouteError />
    },
    {
        path: "/register",
        element: <RegisterPage />,
        errorElement: <RouteError />
    },
    {
        path: "/reset-password",
        element: <ResetPasswordPage />,
        errorElement: <RouteError />
    }
]
