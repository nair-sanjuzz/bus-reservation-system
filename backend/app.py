from flask import Flask, request, jsonify
from flask_migrate import Migrate
from sqlalchemy import func
from flask_cors import CORS
from datetime import date, datetime
from database import db, User, Bus, Seat, Admin, Booking, CancelledBooking

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///buses.db'
CORS(app)
db.init_app(app)
migrate = Migrate(app, db)

# ✅ Helper to ensure seats exist for a bus and date
def ensure_seats_for_bus(bus_id, travel_date):
    seats = Seat.query.filter_by(bus_id=bus_id, date=travel_date).all()
    if not seats:
        for seat_number in range(1, 21):
            new_seat = Seat(
                bus_id=bus_id,
                seat_number=seat_number,
                status="Available",
                date=travel_date
            )
            db.session.add(new_seat)
        db.session.commit()


@app.route('/api/buses', methods=['GET'])
def get_buses():
    source = request.args.get('source', '').strip().lower()
    destination = request.args.get('destination', '').strip().lower()
    travel_date = request.args.get('date', str(date.today()))

    buses = Bus.query.filter(
        func.lower(Bus.source) == source,
        func.lower(Bus.destination) == destination
    ).all()

    bus_list = []

    for bus in buses:
        ensure_seats_for_bus(bus.id, travel_date)

        available_seats = Seat.query.filter_by(bus_id=bus.id,date=travel_date,status="Available").count()

        bus_list.append({
            'id': bus.id,
            'name': bus.name,
            'source': bus.source,
            'destination': bus.destination,
            'available_seats': available_seats,
            'fare': bus.fare,
            'time': bus.time
        })

    return jsonify(bus_list)


@app.route('/api/buses/<int:bus_id>/seats', methods=['GET'])
def get_seats(bus_id):
    travel_date = request.args.get('date', str(date.today()))
    ensure_seats_for_bus(bus_id, travel_date)

    booked_seat_ids = [
        booking.seat_id for booking in Booking.query.filter_by(
            bus_id=bus_id,
            booking_date=travel_date
        ).all()
    ]

    seats = Seat.query.filter_by(bus_id=bus_id, date=travel_date).all()

    seat_data = [{
        'seat_number': seat.seat_number,
        'status': 'Booked' if seat.id in booked_seat_ids else 'Available'
    } for seat in seats]

    return jsonify(seat_data)


@app.route('/api/buses/book_seat/<int:bus_id>', methods=['POST'])
def book_seat(bus_id):
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    contact = data.get('contact')
    seats = data.get('seats')
    travel_date = data.get('date', str(date.today()))

    if not (name and email and contact and seats):
        return jsonify({'error': 'Missing information'}), 400

    try:
        travel_date = datetime.strptime(travel_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=name, email=email, contact_number=contact)
        db.session.add(user)
        db.session.commit()

    ensure_seats_for_bus(bus_id, str(travel_date))

    booked_seat_numbers = []

    for seat_num in seats:
        seat = Seat.query.filter_by(
            bus_id=bus_id,
            seat_number=seat_num,
            date=str(travel_date)
        ).first()

        if seat and seat.status == "Available":
            seat.status = "Booked"
            db.session.add(Booking(
                user_id=user.id,
                seat_id=seat.id,
                bus_id=bus_id,
                booking_date=travel_date
            ))
            booked_seat_numbers.append(seat_num)
        else:
            return jsonify({'error': f'Seat {seat_num} is already booked or does not exist'}), 400

    db.session.commit()

    return jsonify({'message': f'Seats booked successfully: {booked_seat_numbers}'})

# ✅ New API to get booking details before cancellation or ticket generation
@app.route('/api/get_bookings', methods=['POST'])
def get_bookings():
    data = request.get_json()
    email = data.get('email')
    contact = data.get('contact')

    if not (email and contact):
        return jsonify({'error': 'Email and contact number are required.'}), 400

    # Find the user with the provided email and contact number
    user = User.query.filter_by(email=email, contact_number=contact).first()

    if not user:
        return jsonify({'error': 'User not found or details are incorrect.'}), 404

    # Get all bookings for the user with related data
    bookings = Booking.query.filter_by(user_id=user.id).all()

    if not bookings:
        return jsonify({'error': 'No bookings found for this user.'}), 404

    # Get bus details (assuming all bookings are for the same bus)
    bus = Bus.query.get(bookings[0].bus_id)

    # ✅ Include fare and time in response
    response = {
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'contact_number': user.contact_number
        },
        'bus': {
            'id': bus.id,
            'name': bus.name,
            'source': bus.source,
            'destination': bus.destination,
            'fare': bus.fare,
            'time': bus.time
        },
        'bookings': [               # Include booking and seat info
            {
                'id': booking.id,
                'booking_date': str(booking.booking_date),
                'seat': {
                    'id': booking.seat.id,
                    'seat_number': booking.seat.seat_number,
                    'status': booking.seat.status
                }
            } for booking in bookings
        ]
    }

    return jsonify(response)

# Updated API to cancel specific seats
@app.route('/api/cancel_ticket', methods=['POST'])
def cancel_ticket():
    data = request.get_json()
    email = data.get('email')
    contact = data.get('contact')
    seat_ids = data.get('seat_ids', [])

    if not (email and contact):
        return jsonify({'error': 'Email and contact number are required.'}), 400

    if not seat_ids:
        return jsonify({'error': 'Please select at least one seat to cancel.'}), 400

    # Find the user with the provided email and contact number
    user = User.query.filter_by(email=email, contact_number=contact).first()

    if not user:
        return jsonify({'error': 'User not found or details are incorrect.'}), 404

    # Find and cancel the selected bookings
    canceled_seats = []
    for seat_id in seat_ids:
        booking = Booking.query.filter_by(user_id=user.id, seat_id=seat_id).first()
        if booking:
            seat = Seat.query.get(seat_id)
            if seat:
                seat.status = "Available"
                canceled_seats.append(seat.seat_number)
            cancelled = CancelledBooking(
                user_name=user.name,
                email=user.email,
                contact_number=user.contact_number,
                bus_name=booking.bus.name,
                route=f"{booking.bus.source} → {booking.bus.destination}",
                seat_number=booking.seat.seat_number,
                status = "Cancelled",
                travel_date=booking.booking_date,
                cancellation_date=date.today()
            )
            db.session.add(cancelled)
            db.session.delete(booking)
        db.session.commit()
        
    # Check if user has any remaining bookings
    remaining_bookings = Booking.query.filter_by(user_id=user.id).count()
    if remaining_bookings == 0:
        db.session.delete(user)
        db.session.commit()

    return jsonify({
        'message': f'Successfully canceled seat(s): {", ".join(str(s) for s in canceled_seats)}',
        'canceled_seats': canceled_seats
    })

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    admin = Admin.query.filter_by(email=email, password=password).first()
    if admin:
        return jsonify({
            'message': 'Login successful',
            'name': admin.name
        }), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/admin/add_bus', methods=['POST'])
def add_bus():
    data = request.get_json()
    name = data.get('name')
    source_input = data.get('source', '').strip()
    destination_input = data.get('destination', '').strip()
    totalSeat = data.get('totalSeat')
    fare = data.get('fare')
    time = data.get('time')

    # Compare lower-case values
    busDetails = Bus.query.filter(
        func.lower(Bus.source) == source_input.lower(),
        func.lower(Bus.destination) == destination_input.lower(),
        Bus.time == time
    ).first()

    if busDetails:
        return jsonify({'error': 'Bus already exists for the entered time in that route.'}), 401

    # Capitalize properly for storage
    formatted_source = source_input.capitalize()
    formatted_destination = destination_input.capitalize()

    new_bus = Bus(
        name=name,
        source=formatted_source,
        destination=formatted_destination,
        total_seats=totalSeat,
        available_seats=totalSeat,
        fare=fare,
        time=time
    )
    db.session.add(new_bus)
    db.session.commit()

    return jsonify({'message': 'Added New Bus to the system.'}), 200


@app.route('/api/admin/buses', methods=['GET'])
def get_all_buses():
    buses = Bus.query.all()
    bus_list = [{
        'id': bus.id,
        'name': bus.name,
        'source': bus.source,
        'destination': bus.destination,
        'total_seats': bus.total_seats,
        'fare': bus.fare,
        'time': bus.time
    } for bus in buses]
    return jsonify(bus_list)

@app.route('/api/admin/update_bus/<int:bus_id>', methods=['PUT'])
def update_bus(bus_id):
    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    data = request.get_json()
    bus.name = data.get('name', bus.name)
    bus.total_seats = int(data.get('total_seats', bus.total_seats))
    bus.available_seats = int(data.get('total_seats', bus.total_seats))
    bus.fare = data.get('fare', bus.fare)
    bus.time = data.get('time', bus.time)

    db.session.commit()
    return jsonify({'message': 'Bus updated successfully'}), 200

@app.route('/api/admin/delete_bus/<int:bus_id>', methods=['DELETE'])
def delete_bus(bus_id):
    bus = Bus.query.get(bus_id)
    if not bus:
        return jsonify({'error': 'Bus not found'}), 404

    # Delete associated seats and bookings
    Seat.query.filter_by(bus_id=bus_id).delete()
    Booking.query.filter_by(bus_id=bus_id).delete()
    db.session.delete(bus)
    db.session.commit()
    return jsonify({'message': 'Bus deleted successfully'}), 200

@app.route('/api/admin/bookings', methods=['GET'])
def get_all_bookings():
    bookings = Booking.query.all()
    booking_list = []

    for booking in bookings:
        user = booking.user
        bus = booking.bus
        seat = booking.seat

        if not user or not bus or not seat:
            continue  # Skip entries with broken foreign keys

        booking_list.append({
            'user': {
                'name': user.name,
                'email': user.email,
                'contact_number': user.contact_number
            },
            'bus': {
                'name': bus.name,
                'source': bus.source,
                'destination': bus.destination
            },
            'booking_date': str(booking.booking_date),
            'seats': [seat.seat_number],
            'status' : seat.status
        })

    return jsonify(booking_list)


@app.route('/api/admin/cancelled_bookings', methods=['GET'])
def get_cancelled_bookings():
    cancelled = CancelledBooking.query.all()
    cancelled_list = [{
        'user_name': c.user_name,
        'email': c.email,
        'contact_number': c.contact_number,
        'bus_name': c.bus_name,
        'route': c.route,
        'seat_number': c.seat_number,
        'status': c.status,
        'travel_date': str(c.travel_date),
        'cancellation_date': str(c.cancellation_date)
    } for c in cancelled]

    return jsonify(cancelled_list)

if __name__ == '__main__':
    app.run(debug=True)
