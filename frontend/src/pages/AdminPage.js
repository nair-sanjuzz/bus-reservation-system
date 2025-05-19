// src/pages/AdminPage.js
import React, { useEffect, useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminFeatures from "./AdminFeatures";

function AdminPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState("");

    useEffect(() => {
        const adminSession = sessionStorage.getItem("admin");
        if (adminSession) {
            const parsed = JSON.parse(adminSession);
            if (parsed.name) {
                setIsLoggedIn(true);
                setAdminName(parsed.name);
            }
        }
    }, []);

    return (
        <>
            {isLoggedIn ? (
                <AdminFeatures adminName={adminName} setIsLoggedIn={setIsLoggedIn} />
            ) : (
                <AdminLogin setIsLoggedIn={setIsLoggedIn} setAdminName={setAdminName} />
            )}
        </>
    );
}

export default AdminPage;
