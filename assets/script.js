
displayItem = function(data){
    var rand = data[Math.floor(Math.random() * data.length)];
    $('.symbolText').html(rand.symbol)
    $('#desc').html('')
    playTimeout(5000, data, function(data){
        $('#desc').html(rand.name)
        playTimeout(3000, data, displayItem)
    });
}

$(document).ready(function () {
    $('.gameBox').height($('.gameBox').width())
    fetch('assets/data.json').then(response => response.json()).then(data => displayItem(data))
});


function playTimeout(time, data, callback){
    smoothness = 10 // The Lower the better
    var onePart = (408.5/time)*smoothness
    var offset = 0
    var timer = setInterval(() => {
        $(".js-circle-countdown").attr("stroke-dashoffset", offset).attr('stroke',pickHex([255,0,0],[75,181,67],offset/408.5));
        offset += onePart
        if (offset > 408.5){
            callback(data)
            clearInterval(timer);
        }
    }, smoothness);
}

function pickHex(color1, color2, weight) {
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return 'rgb('+rgb+')';
}