import {isRouteErrorResponse, Link, useRouteError} from "react-router-dom";

export function RouteError() {
    const error = useRouteError();

    console.error(error);

    let title = "Có lỗi xảy ra";
    let message = "Trang đang gặp lỗi. Vui lòng thử lại sau.";

    if (isRouteErrorResponse(error)) {
        title = `Lỗi ${error.status}`;
        message = error.statusText || message;
    }

    return (
        <main style={{
            display: "flex",
            minHeight: "60vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center"
        }}>
            <h1 style={{marginBottom: "8px", color: "#1e293b", fontSize: "28px"}}>{title}</h1>
            <p style={{marginBottom: "20px", color: "#64748b", fontSize: "16px"}}>{message}</p>
            <Link
                to="/"
                style={{
                    borderRadius: "6px",
                    backgroundColor: "#5bc0de",
                    color: "#ffffff",
                    padding: "10px 18px",
                    fontWeight: 700
                }}
            >
                Về trang chủ
            </Link>
        </main>
    );
}
