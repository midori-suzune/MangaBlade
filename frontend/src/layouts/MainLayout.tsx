import {Outlet} from "react-router-dom";
import {useEffect} from "react";
import {Header} from "../components/Header/Header.tsx";
import {Menu} from "../components/Menu/Menu.tsx";
import {Footer} from "../components/Footer/Footer.tsx";
import {AuthModal} from "../components/AuthModal/AuthModal.tsx";
import {ScrollToTop} from "../components/ScrollToTop/ScrollToTop.tsx";
import {DisclaimerModal} from "../components/DisclaimerModal/DisclaimerModal.tsx";
import {useAuthStore} from "../stores/authStore.ts";


export function MainLayout(){
    const openAuthModal = useAuthStore((state) => state.openAuthModal);

    useEffect(() => {
        function handleAuthExpired() {
            openAuthModal("login");
        }

        window.addEventListener("mangablade:auth-expired", handleAuthExpired);
        return () => window.removeEventListener("mangablade:auth-expired", handleAuthExpired);
    }, [openAuthModal]);

    return (
        <div className="appShell">
            <Header></Header>
            <Menu></Menu>
            <ScrollToTop />
            <main className="appMain">
                <Outlet></Outlet>
            </main>
            <Footer></Footer>
            <DisclaimerModal />
            <AuthModal />
        </div>
    )
}
