import React, { useState } from "react";
import axios from "axios";
import '../styles/main.scss';

function AdminLogin({ setIsLoggedIn, setAdminName }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/admin/login", {
                email,
                password
            });

            if (response.status === 200) {
                const name = response.data.name;
                setIsLoggedIn(true);
                setAdminName(name);
                sessionStorage.setItem("admin", JSON.stringify({ name: name }));
            }
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <>
            <div className="container">
                <div className="search-box">
                    <h1>Admin Login</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                    {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
                </div>
            </div>
        </>
    );
}

export default AdminLogin;
