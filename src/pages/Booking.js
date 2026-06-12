import { flightService, bookingService, authService } from '../services/api.js';

const Booking = {
    async render() {
        const flightId = sessionStorage.getItem('bookingFlightId');
        if (!flightId) {
            return `
                <div class="container">
                    <div class="auth-container">
                        <h2>No Flight Selected</h2>
                        <p>Please select a flight to book.</p>
                        <button onclick="window.App.navigateTo('flights')" class="btn-primary">Search Flights</button>
                    </div>
                </div>
            `;
        }

        try {
            const flight = await flightService.getFlightById(flightId);
            const currentUser = authService.getCurrentUser();
            
            const price = flight.base_price * flight.price_multiplier;
            
            return `
                <div class="container">
                    <h1>Complete Your Booking</h1>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                        <div>
                            <div class="flight-card">
                                <div class="flight-card-content">
                                    <h3>Flight Details</h3>
                                    <div class="flight-route">
                                        <span class="airport-code">${flight.origin_code}</span>
                                        <span>✈️</span>
                                        <span class="airport-code">${flight.dest_code}</span>
                                    </div>
                                    <div class="flight-details">
                                        <div>
                                            <strong>Airline</strong><br>
                                            ${flight.airline}
                                        </div>
                                        <div>
                                            <strong>Flight Number</strong><br>
                                            ${flight.flight_number}
                                        </div>
                                        <div>
                                            <strong>Departure</strong><br>
                                            ${new Date(flight.departure_time).toLocaleString()}
                                        </div>
                                        <div>
                                            <strong>Arrival</strong><br>
                                            ${new Date(flight.arrival_time).toLocaleString()}
                                        </div>
                                        <div>
                                            <strong>Available Seats</strong><br>
                                            ${flight.available_seats}
                                        </div>
                                        <div>
                                            <strong>Price per Seat</strong><br>
                                            <span class="price">$${price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="auth-container" style="margin-top: 0;">
                                <h3>Passenger Information</h3>
                                <form id="booking-form">
                                    <div class="form-control">
                                        <label>Full Name</label>
                                        <input type="text" id="passenger-name" value="${currentUser.full_name}" required>
                                    </div>
                                    <div class="form-control">
                                        <label>Age</label>
                                        <input type="number" id="passenger-age" required>
                                    </div>
                                    <div class="form-control">
                                        <label>Passport Number</label>
                                        <input type="text" id="passport-number" required>
                                    </div>
                                    <div class="form-control">
                                        <label>Number of Passengers</label>
                                        <select id="passenger-count">
                                            <option value="1">1 Passenger</option>
                                            <option value="2">2 Passengers</option>
                                            <option value="3">3 Passengers</option>
                                            <option value="4">4 Passengers</option>
                                            <option value="5">5 Passengers</option>
                                        </select>
                                    </div>
                                    <div id="extra-passengers"></div>
                                    <div class="form-control">
                                        <label>Total Price</label>
                                        <div id="total-price" style="font-size: 1.5rem; font-weight: bold; color: #1D4ED8;">$${price.toFixed(2)}</div>
                                    </div>
                                    <button type="submit" class="btn-primary">Confirm Booking</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading flight:', error);
            return `
                <div class="container">
                    <div class="auth-container">
                        <h2>Error</h2>
                        <p>Unable to load flight details. Please try again.</p>
                        <button onclick="window.App.navigateTo('flights')" class="btn-primary">Back to Flights</button>
                    </div>
                </div>
            `;
        }
    },
    
    attachEvents() {
        const passengerCount = document.getElementById('passenger-count');
        if (passengerCount) {
            passengerCount.addEventListener('change', (e) => {
                this.updatePassengerFields(parseInt(e.target.value));
                this.updateTotalPrice();
            });
        }
        
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitBooking();
            });
        }
        
        this.updateTotalPrice();
    },
    
    updatePassengerFields(count) {
        const container = document.getElementById('extra-passengers');
        if (!container) return;
        
        let html = '';
        for (let i = 2; i <= count; i++) {
            html += `
                <div class="passenger-fields" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #DDE3EC;">
                    <h4>Passenger ${i}</h4>
                    <div class="form-control">
                        <label>Full Name</label>
                        <input type="text" id="passenger-name-${i}" required>
                    </div>
                    <div class="form-control">
                        <label>Age</label>
                        <input type="number" id="passenger-age-${i}" required>
                    </div>
                    <div class="form-control">
                        <label>Passport Number</label>
                        <input type="text" id="passport-number-${i}" required>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    },
    
    updateTotalPrice() {
        const passengerCount = document.getElementById('passenger-count');
        const flightId = sessionStorage.getItem('bookingFlightId');
        
        if (passengerCount && flightId) {
            flightService.getFlightById(flightId).then(flight => {
                const price = flight.base_price * flight.price_multiplier;
                const total = price * parseInt(passengerCount.value);
                const totalPriceDiv = document.getElementById('total-price');
                if (totalPriceDiv) {
                    totalPriceDiv.textContent = `$${total.toFixed(2)}`;
                }
            }).catch(error => console.error('Error calculating price:', error));
        }
    },
    
    async submitBooking() {
        const flightId = sessionStorage.getItem('bookingFlightId');
        const passengerCount = parseInt(document.getElementById('passenger-count').value);
        
        // Collect passenger information
        const passengers = [];
        
        // Passenger 1
        const passenger1Name = document.getElementById('passenger-name').value;
        const passenger1Age = document.getElementById('passenger-age').value;
        const passenger1Passport = document.getElementById('passport-number').value;
        
        if (!passenger1Name || !passenger1Age || !passenger1Passport) {
            alert('Please fill in all passenger details');
            return;
        }
        
        passengers.push({
            full_name: passenger1Name,
            age: parseInt(passenger1Age),
            passport_number: passenger1Passport
        });
        
        // Additional passengers
        for (let i = 2; i <= passengerCount; i++) {
            const name = document.getElementById(`passenger-name-${i}`)?.value;
            const age = document.getElementById(`passenger-age-${i}`)?.value;
            const passport = document.getElementById(`passport-number-${i}`)?.value;
            
            if (!name || !age || !passport) {
                alert(`Please fill in all details for passenger ${i}`);
                return;
            }
            
            passengers.push({
                full_name: name,
                age: parseInt(age),
                passport_number: passport
            });
        }
        
        // Get flight details for price calculation
        const flight = await flightService.getFlightById(flightId);
        const pricePerSeat = flight.base_price * flight.price_multiplier;
        const totalPrice = pricePerSeat * passengerCount;
        
        // Create booking
        try {
            const booking = await bookingService.createBooking({
                flight_id: parseInt(flightId),
                passengers: passengers,
                total_price: totalPrice
            });
            
            
            alert(`Booking successful! Your booking reference is: ${booking.booking_reference}`);
            sessionStorage.removeItem('bookingFlightId');
            window.App.navigateTo('my-bookings');
        } catch (error) {
            console.error('Booking error:', error);
            alert('Failed to create booking. Please try again.');
        }
        
    }
    
};

export default Booking;