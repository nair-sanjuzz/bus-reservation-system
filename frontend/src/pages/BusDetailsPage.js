import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/main.scss';

function BusDetailsPage() {
    const { busId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const travelDate = queryParams.get("date");

    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [userDetails, setUserDetails] = useState({ name: "", email: "", contact_number: "" });
    const [message, setMessage] = useState("");
    const [fare, setFare] = useState(null);
    const [time, setTime] = useState(null);

    // Get fare/time from router state or fallback
    useEffect(() => {
        const fareFromState = location.state?.fare;
        const timeFromState = location.state?.time;

        if (fareFromState && timeFromState) {
            setFare(fareFromState);
            setTime(timeFromState);
        } else {
            // Fallback to fetch from API
            axios.get(`http://127.0.0.1:5000/api/buses?source=&destination=&date=${travelDate}`)
                .then(res => {
                    const bus = res.data.find(b => b.id === parseInt(busId));
                    if (bus) {
                        setFare(bus.fare);
                        setTime(bus.time);
                    }
                })
                .catch(err => console.error("Error loading bus details:", err));
        }
    }, [location.state, busId, travelDate]);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/api/buses/${busId}/seats?date=${travelDate}`)
            .then(response => setSeats(response.data))
            .catch(error => console.error("Error fetching seats:", error));
    }, [busId, travelDate]);

    const selectSeat = (seatNumber) => {
        if (selectedSeats.includes(seatNumber)) {
            setSelectedSeats(selectedSeats.filter(num => num !== seatNumber));
        } else {
            setSelectedSeats([...selectedSeats, seatNumber]);
        }
    };

    const handleInputChange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
    };

    const bookSelectedSeats = async () => {
        if (selectedSeats.length === 0) {
            setMessage("Please select at least one seat.");
            return;
        }
        if (!userDetails.name || !userDetails.email || !userDetails.contact_number) {
            setMessage("Please fill in all details before confirming.");
            return;
        }

        try {
            const response = await axios.post(`http://127.0.0.1:5000/api/buses/book_seat/${busId}`, {
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.contact_number,
                seats: selectedSeats,
                date: travelDate
            });

            if (response.status === 200) {
                setMessage("Seats booked successfully!");
                setSelectedSeats([]);
                setUserDetails({ name: "", email: "", contact_number: "" });
                setTimeout(() => window.location.reload(), 1500);
            } else {
                setMessage("Failed to book seats. Please try again later.");
            }
        } catch (error) {
            console.error("Error booking seats:", error.response ? error.response.data : error.message);
            setMessage(error.response?.data?.error || "Failed to book seats. Please try again.");
        }
    };

    return (
        <div>
            <h2>Book Your Tickets for - {travelDate}</h2>

            <div className='seat-detail'>
                <div className='seat-layout'>
                    {seats.map(seat => {
                        const isSelected = selectedSeats.includes(seat.seat_number);
                        const seatClass = seat.status === "Booked" ? "booked" : isSelected ? "selected" : "available";

                        return (
                            <button
                                key={seat.seat_number}
                                className={`seat ${seatClass}`}
                                disabled={seat.status === "Booked"}
                                onClick={() => selectSeat(seat.seat_number)}
                            >
                                {seat.seat_number}
                            </button>
                        );
                    })}
                </div>

                <div className='passenger-form'>
                    <h3>Passenger Details</h3>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={userDetails.name}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userDetails.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="contact_number"
                        placeholder="Contact Number"
                        value={userDetails.contact_number}
                        onChange={handleInputChange}
                        required
                    />

                    {/* Fare calculation display */}
                    {fare !== null && (
                        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                            {selectedSeats.length} × ₹{fare} = ₹{selectedSeats.length * fare}
                        </p>
                    )}

                    {message && <p style={{ color: message.includes("successfully") ? "green" : "red", marginTop: "10px" }}>{message}</p>}

                    <br />
                    <button className='book-button' onClick={bookSelectedSeats}>
                        Confirm Booking
                    </button>
                </div>
            </div>

            {/* Optional display of time below */}
            {time && (
                <div style={{ textAlign: "center", marginTop: "15px", fontStyle: "italic" }}>
                    Departure Time: {time}
                </div>
            )}
        </div>
    );
}

export default BusDetailsPage;
