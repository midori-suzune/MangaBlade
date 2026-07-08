import {Outlet} from "react-router-dom";
import {Header} from "../components/Header/Header.tsx";
import {Menu} from "../components/Menu/Menu.tsx";
import {Footer} from "../components/Footer/Footer.tsx";


export function MainLayout(){
    return (
        <div>
            <Header></Header>
            <Menu></Menu>
            <main>
                <Outlet></Outlet>
            </main>
            <Footer></Footer>
        </div>
    )
}
