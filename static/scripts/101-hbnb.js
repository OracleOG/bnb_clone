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

        // Categorize based on parent element
        if ($(this).parent().is('h2')) { // State checkbox
            if (this.checked) {
                states[id] = name;
            } else {
                delete states[id];
            }
        } else if ($(this).hasClass('isAmenity')) { // Amenity checkbox
            if (this.checked) {
                amenities[id] = name;
            } else {
                delete amenities[id];
            }
            // Update Amenities
            let amenityList = Object.values(amenities);
            if (amenityList.length <= 3) {
                $('.amenities h4').html(amenityList.join(', '));
            } else {
                let thirdItemFirstLetter = amenityList[3].charAt(0);
                $('.amenities h4').html(amenityList.slice(0, 3).join(', ') + ', ' + thirdItemFirstLetter + '...');
            }
        } else if ($(this).parent().is('li')) { // City checkbox
            if (this.checked) {
                cities[id] = name;
            } else {
                delete cities[id];
            }
        } 
        
        // Update Locations
        updateLocationsDisplay();
    }, 200)); // 200ms debounce

    // Check API status
    $.get('http://0.0.0.0:5001/api/v1/status/', function(data) {
        if (data.status === 'OK') { 
            $('#api_status').addClass('available');
        } else {
            $('#api_status').removeClass('available');
        }
    });

    // Function to show loading bar
    function showLoadingBar() {
        const $loadingBar = $('<div class="loading-bar"></div>');
        $('header').append($loadingBar);
        $loadingBar.animate({ width: '100%' }, 1000, function() {
            $loadingBar.remove();
        });
    }

    // Function to fetch and display places
    function fetchPlaces(filters) {
        showLoadingBar();
        $.ajax({    
            url: 'http://0.0.0.0:5001/api/v1/places_search/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(filters),
            success: function(data) {
                $('section.places').empty();
                data.forEach(place => {
                    // Updated place HTML with amenities and reviews sections
                    console.log(place);
                    const placeHTML = `
                        <article id="place_${place.id}">
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
                            <div class="place_amenities">
                            <br>
                                <h2>Amenities</h2>
                                <ul>
                                    ${place.amenities ? place.amenities.map(am => {
                                        const imgSrc = `images/${am.name}_icon.png`;
                                        return `<li><img src="${imgSrc}" onerror="this.onerror=null;this.src='✔';"> ${am.name}</li>`;
                                    }).join('') : '<li><i>No amenities<i></li>'}
                                </ul>
                            </div>
                            <div class="reviews">
                                <h2>Reviews <span class="toggle_reviews" data-place_id="${place.id}">show</span></h2>
                                <ul></ul>
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
    }

    // Initial fetch of places
    fetchPlaces({});

    // Handle reviews toggle
    $('body').on('click', '.toggle_reviews', function() {
        let placeId = $(this).data('place_id');
        let $reviewsUl = $(this).closest('.reviews').find('ul');
        let $span = $(this);

        if ($span.text() === 'show') {
            // Fetch reviews
            $.get(`http://0.0.0.0:5001/api/v1/places/${placeId}/reviews`, function(reviewData) {
                let reviewList = '';
                if (reviewData.length > 0) {
                    reviewData.forEach(review => {
                        // Assuming review has user_name and created_at
                        let date = new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        });
                        reviewList += `
                            <li>
                                <h3>From ${review.user_name} the ${date}</h3>
                                <p>${review.text}</p>
                            </li>
                        `;
                    });
                } else {
                    reviewList = '<li>No reviews</li>';
                }
                $reviewsUl.html(reviewList);
                $span.text('hide');
            });
            
        } else {
            // Hide reviews
            $reviewsUl.empty();
            $span.text('show');
        }
    });

    // Search button click handler
    $('button').click(function() {
        fetchPlaces({ amenities: Object.keys(amenities), cities: Object.keys(cities), states: Object.keys(states) });
    });
});