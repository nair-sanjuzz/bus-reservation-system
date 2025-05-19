import React, { useState } from 'react';
import logo from '../components/bus-logo.png';
import '../styles/main.scss';

function GenerateTicket() {
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [showSearch, setShowSearch] = useState(true);

    const handleGenerate = async () => {
        if (!email || !contact) {
            setMessage('Please enter both email and contact number.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/get_bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, contact }),
            });

            const result = await response.json();

            if (response.ok) {
                setUserData(result);
                setMessage('');
                setShowSearch(false);
            } else {
                setMessage(result.error || 'No bookings found for these details');
                setUserData(null);
                setShowSearch(true);
            }
        } catch (error) {
            setMessage('Error fetching booking details. Please try again later.');
            setUserData(null);
            setShowSearch(true);
        }
    };

    const handlePrintTicket = () => {
        window.print();
    };

    const handleNewSearch = () => {
        setShowSearch(true);
        setUserData(null);
        setEmail('');
        setContact('');
        setMessage('');
    };

    return (
        <>
            <div>
                <h2>Generate Ticket</h2>

                {showSearch && (
                    <div className='cancel-search-box'>
                        <div className='passenger-form'>
                            <label>Email: </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                            <label>Contact Number: </label>
                            <input
                                type="text"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                placeholder="Enter your contact number"
                            />
                            <button className='book-button' onClick={handleGenerate}>
                                Retrieve Booking
                            </button>
                        </div>
                        {message && !userData && <p className="message">{message}</p>}
                    </div>
                )}
            </div>
            <div>
                {userData && userData.bookings.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Bookings Found</h3>
                        <p>We couldn't find any bookings associated with these details.</p>
                        <button className='try-again-button' onClick={handleNewSearch}>
                            Try Again
                        </button>
                    </div>
                ) : userData && (
                    <div className="ticket-section">
                        <div className="ticket-details">
                            <h2 style={{ textAlign: "center", marginBottom: "20px" }}> <img src={logo} alt="Bus Logo" className="logo" /> Uni Travels Ticket</h2>

                            <div className="ticket-header">
                                <span className="ticket-id">Booking #: {userData.bookings[0].id}</span>
                                <span className="ticket-date">Issued: {new Date().toLocaleDateString()}</span>
                            </div>

                            <div className="ticket-body">
                                <p><strong>Name:</strong> {userData.user.name}</p>
                                <p><strong>Bus:</strong> {userData.bus.name}</p>
                                <p><strong>Route:</strong> {userData.bus.source} → {userData.bus.destination}</p>
                                <p><strong>Travel Date:</strong> {userData.bookings[0].booking_date}</p>
                                <p><strong>Travel Time:</strong> {userData.bus.time}</p>
                                <p><strong>Seats:</strong> {userData.bookings.map(b => b.seat.seat_number).join(', ')}</p>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button className='print-button' onClick={handlePrintTicket}>
                                Print Ticket
                            </button>
                            <button className='new-search-button' onClick={handleNewSearch}>
                                New Search
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default GenerateTicket;
