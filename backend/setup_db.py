import json
from database import db, User, Bus, Admin
from app import app

def init_db():
    with app.app_context():
        print("Creating tables...")
        db.create_all()

        admin = Admin(
            name = "Sanjay",
            email = "sanjay@uni.com",
            password = "sanj2003"
        )
        db.session.add(admin)
        print("✅ Default admin created.")
        
        # ✅ Load bus data from JSON file
        try:
            with open('buses.json', 'r') as file:
                buses = json.load(file)

            print("Loaded bus data:", buses)

            for bus in buses:
                print("Processing bus:", bus)

                bus_id = bus.get('id')
                name = bus.get('name')
                source = bus.get('source')
                destination = bus.get('destination')
                total_seats = bus.get('seats')
                fare = bus.get('fare')
                time = bus.get('time')

                if not all([bus_id, name, source, destination, total_seats, fare, time]):
                    print(f"Skipping bus due to missing data: {bus}")
                    continue

                new_bus = Bus(
                    id=bus_id,
                    name=name,
                    source=source,
                    destination=destination,
                    total_seats=total_seats,
                    available_seats=total_seats,
                    fare=fare,
                    time=time
                )
                db.session.add(new_bus)

            db.session.commit()
            print("Bus data loaded successfully.")
        except Exception as e:
            print(f"Error loading bus data: {e}")

if __name__ == '__main__':
    init_db()
