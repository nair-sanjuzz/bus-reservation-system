from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

# Admin Table
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

# User Table
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)

# Bus Table
class Bus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    total_seats = db.Column(db.Integer, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    fare = db.Column(db.Integer, nullable=False)  # Fare in ₹
    time = db.Column(db.String(5), nullable=False)  # Format: HH:MM

# Seat Table
class Seat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bus_id = db.Column(db.Integer, db.ForeignKey('bus.id'), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="Available")
    date = db.Column(db.String(20), nullable=False)  # ✅ Added date field for date-specific availability


# Booking Table (User-Seat Association)
class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seat_id = db.Column(db.Integer, db.ForeignKey('seat.id'), nullable=False)
    bus_id = db.Column(db.Integer, db.ForeignKey('bus.id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False, default=date.today)  # Updated to store only date

    # Relationships
    user = db.relationship('User', backref='bookings')
    seat = db.relationship('Seat', backref='bookings')
    bus = db.relationship('Bus', backref='bookings')

class CancelledBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(15), nullable=False)
    bus_name = db.Column(db.String(100), nullable=False)
    route = db.Column(db.String(200), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default="Cancelled")
    travel_date = db.Column(db.Date, nullable=False)
    cancellation_date = db.Column(db.Date, default=date.today)
