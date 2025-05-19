import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/main.scss';

function HomePage() {
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [buses, setBuses] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const today = new Date();
    const minDate = today.toLocaleDateString('en-CA');
    const [date, setDate] = useState(minDate);
    console.log(minDate);

    const maxDateObj = new Date();
    maxDateObj.setDate(today.getDate() + 30);
    const maxDate = maxDateObj.toISOString().split('T')[0];

    const handleSearch = async () => {
        if (!source || !destination || !date) {
            setMessage("Please enter source, destination, and date.");
            return;
        }

        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/buses?source=${source}&destination=${destination}&date=${date}`);
            if (response.data.length === 0) {
                setMessage("No buses available for the selected route and date.");
            } else {
                setBuses(response.data);
                setMessage("");
            }
        } catch (error) {
            console.error("Error searching buses:", error);
            setMessage("An error occurred while searching for buses.");
        }
    };

    const viewSeats = (bus) => {
        navigate(`/bus/${bus.id}?date=${date}`, {
            state: {
                fare: bus.fare,
                time: bus.time
            }
        });
    };


    return (
        <div>
            <div className="container">
                <div className="search-box">
                    <h1>Search Buses</h1>
                    <input
                        type="text"
                        placeholder="Source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                    <input
                        type="date"
                        placeholder="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={minDate}
                        max={maxDate}
                    />
                    <button onClick={handleSearch}>Search</button>
                    {message && <p style={{ color: "red" }}>{message}</p>}
                </div>
            </div>

            {buses.length > 0 && (
                <div>
                    <h2>Available Buses</h2>
                    {buses.map((bus) => (
                        <div key={bus.id} className="bus-card">
                            <div className="left-content">
                                <h3>{bus.name}</h3>
                                <p>Source: {bus.source}</p>
                                <p>Destination: {bus.destination}</p>
                                <p>Available Seats: {bus.available_seats}</p>
                            </div>
                            <div className="right-content">
                                <p>Fare: ₹{bus.fare}</p>
                                <p>Time: {bus.time}</p>
                                <button onClick={() => viewSeats(bus)}>View Seats</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HomePage;
