const FlightCard = {
    render(flight) {
        const price = flight.base_price * flight.price_multiplier;
        const isLoggedIn = window.authService && window.authService.isAuthenticated();
        
        return `
            <div class="flight-card">
                <div class="flight-card-content">
                    <div class="flight-route">
                        <span class="airport-code">${flight.origin_code}</span>
                        <span>✈️</span>
                        <span class="airport-code">${flight.dest_code}</span>
                    </div>
                    <div class="flight-details">
                        <div><strong>${flight.airline}</strong></div>
                        <div>Flight: ${flight.flight_number}</div>
                        <div>Departure: ${new Date(flight.departure_time).toLocaleString()}</div>
                        <div>Arrival: ${new Date(flight.arrival_time).toLocaleString()}</div>
                        <div>Available Seats: ${flight.available_seats}/${flight.total_seats}</div>
                    </div>
                    <div class="flight-info">
                        <span class="price">$${price.toFixed(2)}</span>
                        ${isLoggedIn ? 
                            `<button onclick="window.bookFlight(${flight.id})" class="btn-book" ${flight.available_seats === 0 ? 'disabled' : ''}>Book Now</button>` :
                            `<button onclick="window.navigateTo('login')" class="btn-book">Login to Book</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
};

export default FlightCard;