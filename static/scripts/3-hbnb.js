$(document).ready(function() {
    let amenities = {};

    $('input[type="checkbox"]').change(function() {
        if (this.checked) {
            amenities[$(this).data('id')] = $(this).data('name');
        } else {
            delete amenities[$(this).data('id')];
        }
        let amenityList = Object.values(amenities);
        if (amenityList.length <= 3) {
            $('.amenities h4').html(amenityList.join(', '));
        } else {
            let thirdItemFirstLetter = amenityList[3].charAt(0);
            $('.amenities h4').html(amenityList.slice(0, 3).join(', ') + ', ' + thirdItemFirstLetter + '...');
        }
    });

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

});
