import type {RouteObject} from "react-router-dom";
import {MainLayout} from "../layouts/MainLayout.tsx";
import {Home} from "../pages/Home/Home.tsx";
import {Category} from "../pages/Category/Category.tsx";

export const appRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MainLayout></MainLayout>,
        children : [
            {
                index: true,
                element: <Home></Home>
            },
            {
                path: "category",
                element: <Category></Category>
            }
        ]
    }
]
