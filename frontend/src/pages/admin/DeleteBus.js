import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/main.scss';

function DeleteBus() {
    const [buses, setBuses] = useState([]);
    const [selectedBusId, setSelectedBusId] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/admin/buses")
            .then(res => setBuses(res.data))
            .catch(() => setMessage("Error fetching buses."));
    }, []);

    const handleDelete = async () => {
        if (!selectedBusId) {
            setMessage("Please select a bus to delete.");
            return;
        }

        try {
            const res = await axios.delete(`http://127.0.0.1:5000/api/admin/delete_bus/${selectedBusId}`);
            if (res.status === 200) {
                setMessage("Bus deleted successfully.");
                setBuses(buses.filter(bus => bus.id !== parseInt(selectedBusId)));
                setSelectedBusId("");
            }
        } catch (err) {
            setMessage("Error deleting bus.");
        }
    };

    return (
        <div>
            <div className="container">
                <div className="search-box">
                    <h1>Delete a Bus</h1>
                    <select value={selectedBusId} onChange={e => setSelectedBusId(e.target.value)}>
                        <option value="">Select a bus</option>
                        {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>
                                {bus.name} - {bus.source} → {bus.destination} at {bus.time}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleDelete}>Delete</button>
                    {message && <p style={{ color: "darkred", marginTop: "15px" }}>{message}</p>}
                </div>
            </div>
        </div>
    );
}

export default DeleteBus;
