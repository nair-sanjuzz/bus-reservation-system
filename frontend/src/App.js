import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import Foot from './components/foot';
import HomePage from './pages/HomePage';
import BusDetailsPage from './pages/BusDetailsPage';
import CancelTicket from './pages/CancelTicket';
import GenerateTicket from './pages/GenerateTicket';
import AdminPage from './pages/AdminPage';
import AddBus from './pages/admin/AddBus';
import DeleteBus from './pages/admin/DeleteBus';
import UpdateBus from './pages/admin/UpdateBus';
import BookingList from './pages/admin/BookingList';

import './styles/main.scss';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const admin = sessionStorage.getItem("admin");
        setIsLoggedIn(!!admin);
    }, []);

    return (
        <>
            <BrowserRouter basename="/bus-reservation-system">
                <div className="app-container">
                    <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
                    <div className="content-wrap">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/bus/:busId" element={<BusDetailsPage />} />
                            <Route path="/ticket-cancel" element={<CancelTicket />} />
                            <Route path="/generate-ticket" element={<GenerateTicket />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/admin/add-bus" element={<AddBus />} />
                            <Route path="/admin/delete-bus" element={<DeleteBus />} />
                            <Route path="/admin/update-bus" element={<UpdateBus />} />
                            <Route path="/admin/bookings" element={<BookingList />} />
                        </Routes>
                    </div>
                    <Foot />
                </div>
            </BrowserRouter>
        </>
    );
}

export default App;
