import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/main.scss';

function AddBus() {
    const [name, setName] = useState("");
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [totalSeat, setTotalSeat] = useState("");
    const [fare, setFare] = useState("");
    const [time, setTime] = useState("");
    const [message, setMessage] = useState("");

    const handleSearch = async () => {
        if (!name || !source || !destination || !totalSeat || !fare || !time) {
            setMessage("Please enter source, destination, and date.");
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:5000/api/admin/add_bus", {
                name,
                source,
                destination,
                totalSeat,
                fare,
                time
            });
            if (response.status === 200) {
                setMessage("Successfuly Added a New Bus to the system.");
            }
        } catch (error) {
            console.error("Error adding buses:", error);
            setMessage("Bus already exists for the entered time in that route.");
        }
    };
    return (
        <div>
            <div className="container">
                <div className="search-box">
                    <h1>Add New Bus</h1>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
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
                        type="number"
                        placeholder="Total Seats"
                        value={totalSeat}
                        onChange={(e) => setTotalSeat(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Fare"
                        value={fare}
                        onChange={(e) => setFare(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Time [HH:MM]"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                    <button onClick={handleSearch}>Add Bus</button>
                </div>
                {message && <h2 style={{
                    backgroundColor: message.includes("success") ? "#d4edda" : "#f8d7da",
                    color: message.includes("success") ? "#155724" : "#721c24",
                    width: "100%",
                    borderRadius: "8px"
                }}>{message}</h2>}
            </div>
        </div >
    );
}

export default AddBus;