import {Outlet} from "react-router-dom";
import {Header} from "../components/Header/Header.tsx";
import {Menu} from "../components/Menu/Menu.tsx";
import {Footer} from "../components/Footer/Footer.tsx";
import {AuthModal} from "../components/AuthModal/AuthModal.tsx";
import {ScrollToTop} from "../components/ScrollToTop/ScrollToTop.tsx";


export function MainLayout(){
    return (
        <div className="appShell">
            <Header></Header>
            <Menu></Menu>
            <ScrollToTop />
            <main className="appMain">
                <Outlet></Outlet>
            </main>
            <Footer></Footer>
            <AuthModal />
        </div>
    )
}
