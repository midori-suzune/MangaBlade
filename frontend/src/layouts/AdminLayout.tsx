import { Outlet } from "react-router-dom";
import { ScrollToTop } from "../components/ScrollToTop/ScrollToTop.tsx";

export function AdminLayout() {
    return (
        <>
            <ScrollToTop />
            <Outlet />
        </>
    );
}
