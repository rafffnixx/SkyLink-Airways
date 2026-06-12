import { flightService } from '../services/api.js';

const Flights = {
    async render(searchParams = '') {
        // Show loading state
        let flightsHtml = `
            <div class="container">
                <h1>Available Flights</h1>
                <div class="loading-spinner" style="text-align: center; padding: 3rem;"></div>
            </div>
        `;
        
        let flights = [];
        let searchInfo = '';
        let appliedFilters = {};
        
        try {
            const params = new URLSearchParams(searchParams);
            const filters = {};
            if (params.get('origin')) filters.origin = params.get('origin');
            if (params.get('destination')) filters.destination = params.get('destination');
            if (params.get('date')) filters.date = params.get('date');
            
            appliedFilters = filters;
            flights = await flightService.getAllFlights(filters);
            
        } catch (error) {
            console.error('Error loading flights:', error);
            flightsHtml = `
                <div class="container">
                    <h1>Available Flights</h1>
                    <div class="error-state">
                        <div class="error-icon">⚠️</div>
                        <h3>Unable to Load Flights</h3>
                        <p>There was an error loading the flights. Please try again.</p>
                        <button onclick="window.location.reload()" class="btn-primary">Retry</button>
                    </div>
                </div>
            `;
            return flightsHtml;
        }
        
        // Build search info bar
        if (Object.keys(appliedFilters).length > 0) {
            const filterParts = [];
            if (appliedFilters.origin) filterParts.push(`From ${appliedFilters.origin.toUpperCase()}`);
            if (appliedFilters.destination) filterParts.push(`To ${appliedFilters.destination.toUpperCase()}`);
            if (appliedFilters.date) filterParts.push(`on ${new Date(appliedFilters.date).toLocaleDateString()}`);
            
            searchInfo = `
                <div class="search-info-bar">
                    <div class="search-info-text">
                        <span>🔍</span>
                        <strong>Search Results:</strong> ${filterParts.join(' ')}
                        <span class="results-count">(${flights.length} flight${flights.length !== 1 ? 's' : ''} found)</span>
                    </div>
                    <button onclick="window.App.navigateTo('flights')" class="clear-search-btn">Clear Search</button>
                </div>
            `;
        }
        
        // Build flights list
        let flightsListHtml = '';
        
        if (flights.length === 0) {
            flightsListHtml = `
                <div class="empty-state">
                    <div class="empty-state-icon">✈️</div>
                    <h3>No Flights Found</h3>
                    <p>We couldn't find any flights matching your criteria.</p>
                    <p class="empty-suggestion">Try different airports or dates, or browse all flights.</p>
                    <button onclick="window.App.navigateTo('flights')" class="btn-primary">View All Flights</button>
                </div>
            `;
        } else {
            flightsListHtml = '<div class="flights-list">';
            
            flights.forEach(flight => {
                const price = (flight.base_price * flight.price_multiplier).toFixed(2);
                const departureDate = new Date(flight.departure_time);
                const arrivalDate = new Date(flight.arrival_time);
                const isSoldOut = flight.available_seats === 0;
                const seatPercentage = (flight.available_seats / flight.total_seats) * 100;
                
                flightsListHtml += `
                    <div class="flight-card">
                        <div class="flight-card-content">
                            <div class="flight-card-header">
                                <div class="flight-route-info">
                                    <div class="airports">
                                        <span class="airport-code">${flight.origin_code || 'N/A'}</span>
                                        <span class="flight-arrow">→</span>
                                        <span class="airport-code">${flight.dest_code || 'N/A'}</span>
                                    </div>
                                    <div class="flight-meta">
                                        <span class="airline">${flight.airline || 'Unknown'}</span>
                                        <span class="flight-number">${flight.flight_number || 'N/A'}</span>
                                    </div>
                                </div>
                                <div class="price-container">
                                    <span class="price">$${price}</span>
                                    <span class="price-per">per seat</span>
                                </div>
                            </div>
                            
                            <div class="flight-times">
                                <div class="time-item">
                                    <span class="time-label">Departure</span>
                                    <span class="time-value">${departureDate.toLocaleDateString()}</span>
                                    <span class="time-hour">${departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div class="flight-duration">
                                    <span class="duration-line"></span>
                                    <span class="duration-icon">✈️</span>
                                </div>
                                <div class="time-item">
                                    <span class="time-label">Arrival</span>
                                    <span class="time-value">${arrivalDate.toLocaleDateString()}</span>
                                    <span class="time-hour">${arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                            
                            <div class="flight-seats-info">
                                <div class="seats-bar">
                                    <div class="seats-fill" style="width: ${seatPercentage}%"></div>
                                </div>
                                <div class="seats-text">
                                    <span>${flight.available_seats} seats available</span>
                                    <span class="seats-total">out of ${flight.total_seats}</span>
                                </div>
                            </div>
                            
                            <div class="flight-actions">
                                <button onclick="window.bookFlight(${flight.id})" class="btn-book" ${isSoldOut ? 'disabled' : ''}>
                                    ${isSoldOut ? 'Sold Out' : 'Book This Flight'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            flightsListHtml += '</div>';
        }
        
        // Build the search form
        const searchFormHtml = `
            <div class="flights-search-panel">
                <h2>Search Flights</h2>
                <form id="flights-search-form" class="flights-search-form">
                    <div class="search-row">
                        <div class="form-group">
                            <label>From</label>
                            <input type="text" id="search-origin" placeholder="City or Airport Code" 
                                   value="${appliedFilters.origin || ''}" autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label>To</label>
                            <input type="text" id="search-destination" placeholder="City or Airport Code" 
                                   value="${appliedFilters.destination || ''}" autocomplete="off">
                        </div>
                        <div class="form-group">
                            <label>Departure Date</label>
                            <input type="date" id="search-date" value="${appliedFilters.date || ''}">
                        </div>
                        <div class="form-group search-actions">
                            <button type="submit" class="btn-primary">Search Flights</button>
                            ${Object.keys(appliedFilters).length > 0 ? 
                                `<button type="button" class="btn-secondary" onclick="window.App.navigateTo('flights')">Clear</button>` : 
                                ''}
                        </div>
                    </div>
                </form>
            </div>
        `;
        
        return `
            <div class="container">
                <h1>Available Flights</h1>
                ${searchFormHtml}
                ${searchInfo}
                ${flightsListHtml}
            </div>
        `;
    },
    
    attachEvents() {
        const searchForm = document.getElementById('flights-search-form');
        if (searchForm) {
            // Remove existing listener to avoid duplicates
            const newForm = searchForm.cloneNode(true);
            searchForm.parentNode.replaceChild(newForm, searchForm);
            
            newForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const origin = document.getElementById('search-origin')?.value;
                const destination = document.getElementById('search-destination')?.value;
                const date = document.getElementById('search-date')?.value;
                
                const params = new URLSearchParams();
                if (origin && origin.trim()) params.append('origin', origin.trim().toUpperCase());
                if (destination && destination.trim()) params.append('destination', destination.trim().toUpperCase());
                if (date) params.append('date', date);
                
                if (window.App && typeof window.App.navigateTo === 'function') {
                    window.App.navigateTo('flights', params.toString());
                }
            });
        }
        
        // Add input validation for airport codes (uppercase, 3 letters)
        const originInput = document.getElementById('search-origin');
        const destInput = document.getElementById('search-destination');
        
        if (originInput) {
            originInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().slice(0, 3);
            });
        }
        
        if (destInput) {
            destInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase().slice(0, 3);
            });
        }
    }
};

export default Flights;