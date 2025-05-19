import React, { useState } from 'react';
import '../styles/main.scss';

function CancelTicket() {
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    const handleCancel = async () => {
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
            } else {
                setMessage(result.error);
                setUserData(null);
            }
        } catch (error) {
            setMessage('Error fetching booking details. Please try again later.');
            setUserData(null);
        }
    };

    const handleSeatSelection = (seatId) => {
        setSelectedSeats(prev => 
            prev.includes(seatId) 
                ? prev.filter(id => id !== seatId) 
                : [...prev, seatId]
        );
    };

    const confirmCancellation = async () => {
        if (selectedSeats.length === 0) {
            setMessage('Please select at least one seat to cancel.');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/api/cancel_ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    contact,
                    seat_ids: selectedSeats 
                }),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage(result.message);
                setUserData(null);
                setEmail('');
                setContact('');
                setSelectedSeats([]);
            } else {
                setMessage(result.error);
            }
        } catch (error) {
            setMessage('Error canceling the ticket. Please try again later.');
        }
    };

    return (
        <div>
            <h2>Cancel Ticket</h2>
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
                    <button className='book-button' onClick={handleCancel}>
                        Retrieve Bookings
                    </button>
                </div>
                {message && !userData && <p className="message">{message}</p>}
            </div>

            {userData && (
                <div className="booking-section">
                    <div className="booking-details">
                        <h3>Booking Details for {userData.user.name}</h3>
                        <div className="booking-info">
                            <p><strong>Bus:</strong> {userData.bus.name}</p>
                            <p><strong>Route:</strong> {userData.bus.source} to {userData.bus.destination}</p>
                            <p><strong>Travel Date:</strong> {userData.bookings[0].booking_date}</p>
                            
                            <h4>Select Seats to Cancel:</h4>
                            <div className="seat-selection">
                                {userData.bookings.map(booking => (
                                    <button
                                        key={booking.seat.id}
                                        className={`seat-button ${selectedSeats.includes(booking.seat.id) ? 'selected' : ''}`}
                                        onClick={() => handleSeatSelection(booking.seat.id)}
                                    >
                                        {booking.seat.seat_number}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="confirmation-section">
                        <button 
                            className='cancel-button' 
                            onClick={confirmCancellation}
                        >
                            Confirm Cancellation
                        </button>
                    </div>
                    
                    {message && <p className="message">{message}</p>}
                </div>
            )}
        </div>
    );
}

export default CancelTicket;