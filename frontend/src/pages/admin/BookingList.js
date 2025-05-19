import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/main.scss';

function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [cancelled, setCancelled] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/admin/bookings")
        .then(response => {
            setBookings(response.data);
            setMessage("");
        })
        .catch(error => {
            console.error("Error fetching bookings:", error);
            setMessage("Failed to load booking data.");
        });
        axios.get("http://127.0.0.1:5000/api/admin/cancelled_bookings")
        .then(response =>{
            setCancelled(response.data);
            setMessage("");
        })
        .catch(error => {
            console.error("Error fetching bookings:", error);
            setMessage("Failed to load booking data.");
        });
    }, []);

    return (
        <div>
            <div className="container">
                <h1 className='admin' style={{ textAlign: "center", marginBottom: "20px" }}>All Bookings</h1>
                {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}

                {bookings.length > 0 ? (
                    <table className="booking-table">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>Email</th>
                                <th>Contact Number</th>
                                <th>Bus Name</th>
                                <th>Route</th>
                                <th>Travel Date</th>
                                <th>Seat Number(s)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking, index) => (
                                <tr key={index}>
                                    <td>{booking.user.name}</td>
                                    <td>{booking.user.email}</td>
                                    <td>{booking.user.contact_number}</td>
                                    <td>{booking.bus.name}</td>
                                    <td>{booking.bus.source} → {booking.bus.destination}</td>
                                    <td>{booking.booking_date}</td>
                                    <td>{booking.seats.join(', ')}</td>
                                    <td style={{color:"green"}}>{booking.status}</td>
                                </tr>
                            ))}
                            {cancelled.map((cancel, index)=>(
                                <tr key={index}>
                                    <td>{cancel.user_name}</td>
                                    <td>{cancel.email}</td>
                                    <td>{cancel.contact_number}</td>
                                    <td>{cancel.bus_name}</td>
                                    <td>{cancel.route}</td>
                                    <td>{cancel.travel_date}</td>
                                    <td>{cancel.seat_number}</td>
                                    <td style={{color:"red"}}>{cancel.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    !message && <p style={{ textAlign: "center" }}>No bookings available.</p>
                )}
            </div>
        </div>
    );
}

export default BookingList;