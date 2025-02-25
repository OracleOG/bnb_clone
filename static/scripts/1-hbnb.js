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
});
