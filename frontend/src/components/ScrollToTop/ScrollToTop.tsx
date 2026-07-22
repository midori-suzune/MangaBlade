import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import styles from "./ScrollToTop.module.css";

export function ScrollToTop() {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0 });
    }, [pathname]);

    // Show/hide floating button on scroll
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 250) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // Hide floating button on chapter reading page (reading page has its own bottom bar)
    const isReadingPage = pathname.includes("/manga/") && pathname.includes("/c/");
    if (isReadingPage || !isVisible) {
        return null;
    }

    return (
        <button
            type="button"
            className={styles.scrollTopBtn}
            onClick={scrollToTop}
            aria-label="Cuộn lên đầu trang"
            title="Chuyển lên đầu trang"
        >
            <ArrowUp size={20} strokeWidth={2.5} />
        </button>
    );
}
