const FlightCard = {
    render(flight) {
        const price = (flight.base_price * flight.price_multiplier).toFixed(2);
        const isLoggedIn = window.authService && window.authService.isAuthenticated();
        const isSoldOut = flight.available_seats === 0;
        const seatPercentage = (flight.available_seats / flight.total_seats) * 100;
        
        const departureDate = new Date(flight.departure_time);
        const arrivalDate = new Date(flight.arrival_time);
        
        // Determine seat availability class and text
        let seatClass = '';
        let seatText = '';
        if (isSoldOut) {
            seatClass = 'seat-sold-out';
            seatText = 'Sold Out';
        } else if (flight.available_seats <= 10) {
            seatClass = 'seat-low';
            seatText = 'Only ' + flight.available_seats + ' left!';
        } else {
            seatClass = 'seat-available';
            seatText = flight.available_seats + ' seats available';
        }
        
        return `
            <div class="flight-card">
                <div class="flight-card-content">
                    <!-- Flight Route -->
                    <div class="flight-route-header">
                        <div class="route-cities">
                            <div class="city">
                                <span class="airport-code">${flight.origin_code || 'N/A'}</span>
                                <span class="city-name">${flight.origin_city || ''}</span>
                            </div>
                            <div class="route-icon">✈️</div>
                            <div class="city">
                                <span class="airport-code">${flight.dest_code || 'N/A'}</span>
                                <span class="city-name">${flight.dest_city || ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Flight Airline Info -->
                    <div class="flight-airline-info">
                        <span class="airline-name">${flight.airline || 'Unknown Airline'}</span>
                        <span class="flight-number">Flight ${flight.flight_number || 'N/A'}</span>
                    </div>
                    
                    <!-- Flight Times -->
                    <div class="flight-times">
                        <div class="time-info">
                            <span class="time-label">Departure</span>
                            <span class="time-date">${departureDate.toLocaleDateString()}</span>
                            <span class="time-hour">${departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div class="duration-line"></div>
                        <div class="time-info">
                            <span class="time-label">Arrival</span>
                            <span class="time-date">${arrivalDate.toLocaleDateString()}</span>
                            <span class="time-hour">${arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                    
                    <!-- Seats Availability -->
                    <div class="seats-container">
                        <div class="seats-bar">
                            <div class="seats-fill ${seatClass}" style="width: ${seatPercentage}%"></div>
                        </div>
                        <div class="seats-status ${seatClass}">
                            <span>🪑</span>
                            <span>${seatText}</span>
                        </div>
                    </div>
                    
                    <!-- Price and Booking -->
                    <div class="flight-footer">
                        <div class="price-container">
                            <span class="price-label">Starting from</span>
                            <span class="price-value">$${price}</span>
                            <span class="price-per">per seat</span>
                        </div>
                        ${isLoggedIn ? 
                            `<button onclick="window.bookFlight(${flight.id})" class="btn-book ${isSoldOut ? 'btn-disabled' : ''}" ${isSoldOut ? 'disabled' : ''}>
                                ${isSoldOut ? 'Sold Out' : 'Book Now →'}
                            </button>` :
                            `<button onclick="window.navigateTo('login')" class="btn-book">Login to Book →</button>`
                        }
                    </div>
                </div>
            </div>
        `;
    }
};

export default FlightCard;