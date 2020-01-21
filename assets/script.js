var run = true
isLoaded = false
totalWords = []
skip = false
leftSkip = true
obkp = 0

displayItem = function () {
    var rand = totalWords[Math.floor(Math.random() * totalWords.length)];
    $('.symbolText').css('font-size', 150/Math.pow((rand.symbol.length),0.7).toString() + 'px')
    $('.symbolText').html(rand.symbol)
    $('#desc').html('')
    $('#mean').html('')
    playTimeout(5000, function () {
        $('#desc').css('font-size', 40/Math.pow((rand.name.length),0.2).toString() + 'px')
        $('#desc').html(rand.name)
        if(rand.meaning){
            $('#mean').css('font-size', 40/Math.pow((rand.meaning.length),0.2).toString() + 'px')
            $('#mean').html(rand.meaning)
        }
        playTimeout(5000, displayItem)
    });
}

function playTimeout(time, callback) {
    smoothness = 10 // The Lower the better
    var onePart = (544 / time) * smoothness
    if(obkp != 0){
        offset = obkp
        obkp = 0
    }else{
        offset = 0
    }
    var timer = setInterval(() => {
        if (run) {
            $(".js-circle-countdown").attr("stroke-dashoffset", offset).attr('stroke', pickHex([255, 0, 0], [75, 181, 67], offset / 456));
            offset += onePart
            if(skip == true){
                if(callback.name == "displayItem"){
                    if(leftSkip){
                        skip = false
                        offset = 544
                    }
                }else{
                    obkp = offset+onePart*5
                    offset = 544
                }
            }
            if (offset >= 544) {
                callback()
                clearInterval(timer);
            }
        }
    }, smoothness);
}

function pickHex(color1, color2, weight) {
    var w1 = weight;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return 'rgb(' + rgb + ')';
}

showOptions = function (data) {
    toReturn = ''
    data.forEach(section => {
        toReturn += `<section class="mt-4">
            <div class="float-right custom-control custom-checkbox checkbox-success">
                <input type="checkbox" class="custom-control-input form-control section" id="${section.name}">
                <label class="custom-control-label head" for="${section.name}"></label>
            </div>
            <h3>${section.name}</h3>
            <div class="px-4">`
        section.options.forEach(option => {
            toReturn += `<div class="custom-control custom-checkbox checkbox-success">
                <input type="checkbox" class="custom-control-input form-control option" id="${option.name}" loc="${option.file}">
                <label class="custom-control-label sub" for="${option.name}">${option.name}</label>
            </div>`
        })
        toReturn += `
            </div>
        </section>`
    });
    $('#showOptions').html(toReturn)
    $(".section").change(function () {
        if ($(this).is(":checked")) {
            $(this).parent().parent().find('.option').each((i, o) => $(o).prop('checked', true))
        }
    });
}

loadPractice = function (url = null) {
    present = false
    if(url!=null){
        fetch(url).then(response => response.json()).then(data => {
            totalWords.push(...data)
            if (!isLoaded) {
                displayItem();
                isLoaded = true
            }
        })
    }
    $('.option').each((i, o) => {
        if ($(o).is(":checked")) {
            present = true
            fetch($(o).attr('loc')).then(response => response.json()).then(data => {
                totalWords.push(...data)
                if (!isLoaded) {
                    displayItem();
                    isLoaded = true
                }
            })
        }
    })
    if(!present){
        alert('Please Select atleast One Option')
        return
    }
    $('.menu').hide()
    $('.practice').fadeIn()
    $('.gameBox').height($('.gameBox').width())
}