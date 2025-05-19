import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/main.scss";

function UpdateBus() {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        total_seats: "",
        fare: "",
        time: ""
    });
    const [message, setMessage] = useState("");

    // Fetch all buses on load
    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/admin/buses")
            .then(response => setBuses(response.data))
            .catch(error => console.error("Error fetching buses:", error));
    }, []);

    // When bus selected, populate form
    const handleSelectBus = (e) => {
        const busId = e.target.value;
        setSelectedBusId(busId);
        const selectedBus = buses.find(bus => bus.id === parseInt(busId));
        if (selectedBus) {
            setFormData({
                name: selectedBus.name,
                total_seats: selectedBus.total_seats,
                fare: selectedBus.fare,
                time: selectedBus.time
            });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        if (!selectedBusId) {
            setMessage("Please select a bus to update.");
            return;
        }

        try {
            const response = await axios.put(`http://127.0.0.1:5000/api/admin/update_bus/${selectedBusId}`, formData);
            if (response.status === 200) {
                setMessage("Bus details updated successfully.");
            }
        } catch (error) {
            console.error("Error updating bus:", error);
            setMessage("An error occurred while updating bus details.");
        }
    };

    return (
        <div>
            <div className="container">
                <div className="search-box">
                    <h1>Update Bus Info</h1>

                    <select onChange={handleSelectBus} value={selectedBusId}>
                        <option value="">Select Bus</option>
                        {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>
                                {bus.name} ({bus.source} → {bus.destination})
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        name="name"
                        placeholder="Bus Name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <input
                        type="number"
                        name="total_seats"
                        placeholder="Total Seats"
                        value={formData.total_seats}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="fare"
                        placeholder="Fare"
                        value={formData.fare}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="time"
                        placeholder="Time (HH:MM)"
                        value={formData.time}
                        onChange={handleChange}
                    />
                    <button onClick={handleUpdate}>Update Bus</button>
                    {message && <h2 style={{ backgroundColor: "ghostwhite", width: "100%" }}>{message}</h2>}
                </div>
            </div>
        </div>
    );
}

export default UpdateBus;
