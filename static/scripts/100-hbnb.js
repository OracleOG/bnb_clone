$(document).ready(function() {
    let amenities = {};
    let states = {};
    let cities = {};

    // Debounce function to limit rapid updates
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Update display function
    function updateLocationsDisplay() {
        let stateList = Object.values(states);
        let cityList = Object.values(cities);
        let displayText = '';

        // Combine states and cities creatively
        if (stateList.length > 0 && cityList.length > 0) {
            displayText = `${stateList.slice(0, 2).join(', ')} (${cityList.slice(0, 2).join(', ')})`;
            if (stateList.length > 2 || cityList.length > 2) {
                displayText += '…';
            }
        } else if (stateList.length > 0) {
            displayText = stateList.length <= 3 ? stateList.join(', ') : `${stateList.slice(0, 3).join(', ')}, ${stateList[3].charAt(0)}...`;
        } else if (cityList.length > 0) {
            displayText = cityList.length <= 3 ? cityList.join(', ') : `${cityList.slice(0, 3).join(', ')}, ${cityList[3].charAt(0)}...`;
        }

        // Apply fade-in effect
        const $locationsH4 = $('.locations h4');
        $locationsH4.removeClass('active').addClass('fade-in');
        $locationsH4.html(displayText || '&nbsp;'); // Use &nbsp; to maintain spacing if empty
        setTimeout(() => $locationsH4.addClass('active'), 10); // Trigger fade-in
    }

    // Event listener with debounce
    $('input[type="checkbox"]').on('change', debounce(function() {
        let id = $(this).data('id');
        let name = $(this).data('name');

        // Categorize based on parent element (creative alternative to classes)
        if ($(this).parent().is('h2')) { // State checkbox
            if (this.checked) {
                console.log('state checked');
                states[id] = name;
            } else {
                delete states[id];
            }
        } else if ($(this).hasClass('isAmenity')) { // Amenity checkbox
            if (this.checked) {
                console.log('amenity checked');
                amenities[id] = name;
                console.log(amenities);
                console.log('amenity name: ', name);
            } else {
                delete amenities[id];
            }
            // Update Amenities (unchanged)
            let amenityList = Object.values(amenities);
            if (amenityList.length <= 3) {
                $('.amenities h4').html(amenityList.join(', '));
            } else {
                let thirdItemFirstLetter = amenityList[3].charAt(0);
                $('.amenities h4').html(amenityList.slice(0, 3).join(', ') + ', ' + thirdItemFirstLetter + '...');
            }
        } else if ($(this).parent().is('li')) { // City checkbox
            if (this.checked) {
                console.log('city checked');
                cities[id] = name;
                console.log(cities);
                console.log('city name: ', name);
            } else {
                delete cities[id];
            }
        } 
        
        // Update Locations
        updateLocationsDisplay();
        }, 200)); // 200ms debounce

    $.get('http://0.0.0.0:5001/api/v1/status/', function(data) {
        if (data.status === 'OK') { 
            $('#api_status').addClass('available');
        } else {
            $('#api_status').removeClass('available');
        }
    });

    $.ajax({    
        url: 'http://0.0.0.0:5001/api/v1/places_search/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({}),
        success: function(data) {
            $('section.places').empty();
            console.log(data);
            data.forEach(place => {
                const placeHTML = `
                    <article>
                        <div class="title_box">
                            <h2>${place.name}</h2>
                            <div class="price_by_night">$${place.price_by_night}</div>
                        </div>
                        <div class="information">
                            <div class="max_guest">${place.max_guest} Guest(s)</div>
                            <div class="number_rooms">${place.number_rooms} Room(s)</div>
                            <div class="number_bathrooms">${place.number_bathrooms} Bathroom(s)</div>
                        </div>
                        <div class="description">
                            ${place.description}
                        </div>
                    </article>
                `;
                $(".places").append(placeHTML);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching places:", error);
        }
    });

    $('button').click(function() {
        $.ajax({
            url: 'http://0.0.0.0:5001/api/v1/places_search/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ amenities: Object.keys(amenities), cities: Object.keys(cities), states: Object.keys(states) }),
            success: function(data) {
                $('section.places').empty();
                data.forEach(place => {
                    const placeHTML = `
                        <article>
                            <div class="title_box">
                                <h2>${place.name}</h2>
                                <div class="price_by_night">$${place.price_by_night}</div>
                            </div>
                            <div class="information">
                                <div class="max_guest">${place.max_guest} Guest(s)</div>
                                <div class="number_rooms">${place.number_rooms} Room(s)</div>
                                <div class="number_bathrooms">${place.number_bathrooms} Bathroom(s)</div>
                            </div>
                            <div class="description">
                                ${place.description}
                            </div>
                        </article>
                    `;
                    $(".places").append(placeHTML);
                });
            },
            error: function(xhr, status, error) {
                console.error("Error fetching places:", error);
            }
        });
    });

});
