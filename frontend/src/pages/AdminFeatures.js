// src/pages/AdminFeatures.js
import React from "react";
import { useNavigate } from "react-router-dom";

function AdminFeatures({ adminName, setIsLoggedIn }) {
    const navigate = useNavigate();

    return (
        <div>
            <div className="container">
                <h1 className="admin">Welcome, {adminName}!!</h1>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "20px",
                        flexWrap: "wrap",
                        padding: "0 10%",
                    }}
                >
                    <button className="book-button" onClick={() => navigate('/admin/add-bus')}>Add New Bus</button>
                    <button className="book-button" onClick={() => navigate('/admin/delete-bus')}>Delete a Bus</button>
                    <button className="book-button" onClick={() => navigate('/admin/update-bus')}>Update Bus Info</button>
                    <button className="book-button" onClick={() => navigate('/admin/bookings')}>View All Bookings</button>
                </div>
            </div>
        </div>
    );
}

export default AdminFeatures;
