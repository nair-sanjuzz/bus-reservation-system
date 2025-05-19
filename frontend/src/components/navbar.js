import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from './bus-logo.png';
import '../styles/main.scss';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const adminSession = sessionStorage.getItem("admin");
        setIsLoggedIn(!!adminSession);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("admin");
        setIsLoggedIn(false);
        navigate("/admin");
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                <img src={logo} alt="Bus Logo" className="logo" />
                <span className="navbar-title">Union Travels</span>
            </Link>
            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/generate-ticket">Generate Ticket</Link></li>
                <li><Link to="/ticket-cancel">Cancel Ticket</Link></li>
                <li><Link to="/admin">Admin Panel</Link></li>
                {isLoggedIn && (
                    <li>
                        <button onClick={handleLogout} className="logout">Logout</button>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
