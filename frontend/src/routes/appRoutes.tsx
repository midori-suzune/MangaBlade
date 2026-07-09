import type {RouteObject} from "react-router-dom";
import {MainLayout} from "../layouts/MainLayout.tsx";
import {Home} from "../pages/Home/Home.tsx";
import {LoginPage} from "../pages/Login/LoginPage.tsx";
import {RegisterPage} from "../pages/Register/RegisterPage.tsx";
import ResetPasswordPage from "../pages/ResetPassword/ResetPasswordPage.tsx";
import {CategoryPage} from "../pages/Category/CategoryPage.tsx";
import {MangaDetailPage} from "../pages/MangaDetail/MangaDetailPage.tsx";

export const appRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout />,
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
            }
        ]
    },
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/register",
        element: <RegisterPage />
    },
    {
        path: "/reset-password",
        element: <ResetPasswordPage />
    }
]
