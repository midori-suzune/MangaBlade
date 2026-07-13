import type {RouteObject} from "react-router-dom";
import {MainLayout} from "../layouts/MainLayout.tsx";
import {Home} from "../pages/Home/Home.tsx";
import {LoginPage} from "../pages/Login/LoginPage.tsx";
import {RegisterPage} from "../pages/Register/RegisterPage.tsx";
import ResetPasswordPage from "../pages/ResetPassword/ResetPasswordPage.tsx";
import {CategoryPage} from "../pages/Category/CategoryPage.tsx";
import {MangaDetailPage} from "../pages/MangaDetail/MangaDetailPage.tsx";
import {ReadingMangaPage} from "../pages/ReadingManga/ReadingMangaPage.tsx";
import {UserProfile} from "../pages/UserProfile/UserProfile.tsx";
import {RouteError} from "./RouteError.tsx";

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
