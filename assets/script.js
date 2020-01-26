var run = true
isLoaded = false
totalWords = []
skip = false
leftSkip = true
obkp = 0

displayItem = function () {
    var rand = totalWords[Math.floor(Math.random() * totalWords.length)];
    $('.symbolBox').html(rand.symbol)
    $('#desc').html('')
    $('#mean').html('')
    playTimeout(5000, function () {
        $('#desc').html(rand.name)
        if(rand.meaning){
            $('#mean').html(rand.meaning)
        }
        playTimeout(5000, displayItem)
    });
}

function playTimeout(time, callback) {
    smoothness = 10 // The Lower the better
    var onePart = (100 / time) * smoothness
    if(obkp != 0){
        offset = obkp
        obkp = 0
    }else{
        offset = 0
    }
    var timer = setInterval(() => {
        if (run) {
            $('.timing').css('width', offset.toString()+"%").css('background',pickHex([255, 0, 0], [75, 181, 67], offset / 100))
            if(skip == true){
                if(callback.name == "displayItem"){
                    if(leftSkip){
                        offset = 100
                    }
                }else{
                    obkp = offset+onePart*5
                    offset = 100
                }
            }else{
                offset += onePart
            }
            if (offset >= 100) {
                if(callback.name == "displayItem"){
                    skip = false
                }
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

showOptions = function () {
    toReturn = ''
    myData.forEach((section) => {
        toReturn += `<section class="mt-4">
            <div class="float-right custom-control custom-checkbox checkbox-success">
                <input type="checkbox" class="custom-control-input form-control section" id="${section.name}">
                <label class="custom-control-label head" for="${section.name}"></label>
            </div>
            <h3>${section.name}</h3>
            <div class="px-4">`
        section.options.forEach((option,j) => {
            toReturn += `<div class="custom-control custom-checkbox checkbox-success">
                <input type="checkbox" class="custom-control-input form-control option" id="${section.id}${option.id}" loc="${section.id},${option.id}">
                <label class="custom-control-label sub" for="${section.id}${option.id}">${option.name}</label>
                <button class="btn btn-sm btn-default text-light py-0" onclick="showWords('${section.id}','${option.id}','${option.name}')"><i class="fas fa-external-link-alt"></i></button>
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

loadPractice = function () {
    present = false
    $('.option').each((i, o) => {
        if ($(o).is(":checked")) {
            present = true
            console.log("true")
            db.collection("/Words/"+$(o).attr('loc').split(',')[0]+"/Options/"+$(o).attr('loc').split(',')[1]+"/Words").orderBy("addTime").get().then(function(querySnapshot) {
                data = []
                querySnapshot.forEach(function(doc) {
                    data.push(doc.data())
                    totalWords.push(...data)
                })
                if (!isLoaded) {
                    console.log("Loaded")
                    displayItem();
                    isLoaded = true
                }
            });
        }
    })
    if(!present){
        alert('Please Select atleast One Option')
        return
    }
    $('.menu').hide()
    $('.gameBox').fadeIn()
    
}

function showWords(i,j,name){
    db.collection("/Words/"+i+"/Options/"+j+"/Words").orderBy("addTime").get().then(function(querySnapshot) {
        data = []
        querySnapshot.forEach(function(doc) {
            data.push(doc.data())
        });
        toReturn = `<table class="table table-striped table-bordered"><thead><tr><th>Symbol</th><th>Translation</th><th>Meaning</th></tr></thead><tbody>`
        for(s in data){
            toReturn += `<tr><td>${data[s].symbol}</td><td>${data[s].name}</td><td>${data[s].meaning}</td></tr>`
        }
        toReturn += `</tbody></table>`
        $('#showWordsModal').find('.modal-body').html(toReturn)
    });
    $('#showWordsModal').find('#modalTitle').html(name)
    $('#showWordsModal').modal('show')
}

function addOption(){
    db.collection("Words")
        .doc($('#allSectionSelect').val())
        .collection("Options")
        .add({
            addTime: firebase.firestore.Timestamp.now(),
            name: $('#newOptionName').val(),
        }).then(doc => {
            document.location = "/addWords.html";
        })
}

function addSection(name){
    db.collection("Words")
        .add({
            addTime: firebase.firestore.Timestamp.now(),
            name: $('#newSectionName').val(),
        }).then(doc => {
            document.location = document.location.href;
        })
}

function loadOptions(){
    $("#allOptionSelect").html('')
    db.collection("/Words/"+$('#allSectionSelect').val()+"/Options/").orderBy("addTime","desc").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            $("#allOptionSelect").append('<option value="'+doc.id+'">'+doc.data().name+'</option>')
        });
    });
}

function loadSelectOptions(){
    $("#allSectionSelect").html('')
    db.collection("Words")
            .orderBy("addTime","desc")
            .get()
            .then(function (querySnapshot) {
                querySnapshot.forEach(function (doc) {
                    $("#allSectionSelect").append(`<option value="${doc.id}">${doc.data().name}</option>`)
                });
                loadOptions()
            })
            .catch(function (error) {
                console.log("Error getting documents: ", error);
            });
}

function editItem(i,j,k){
    $('#showWordsModal').modal('hide')
    $('.menu').hide()
    $('#editForm').show()
    var docRef = db.collection("/Words/"+i+"/Options/"+j+"/Words").doc(k);
    docRef.get().then(function(doc) {
        if (doc.exists) {
            data = doc.data();
            $("#item").val(`${i},${j},${k}`)
            $('#meaning').val(data["meaning"])
            $('#symbol').val(data["symbol"])
            $('#name').val(data["name"])
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    })      
}

function updateItem(){
    i = $("#item").val().split(',')[0]
    j = $("#item").val().split(',')[1]
    k = $("#item").val().split(',')[2]
    var docRef = db.collection("/Words/"+i+"/Options/"+j+"/Words").doc(k);
    docRef.update({
        meaning: $('#meaning').val(),
        symbol: $('#symbol').val(),
        name: $('#name').val()
    }).then(function (){
        $('.menu').show()
        $('#editForm').hide()
        $('#successAlert').html(`<strong>Success!!</strong> Update Successful.`)
        $('#successAlert').show()
    })
}

function deleteItem(i,j,k){
    var docRef = db.collection("/Words/"+i+"/Options/"+j+"/Words").doc(k);
    docRef.delete().then(function (){   
        $('#showWordsModal').modal('hide')
        $('#successAlert').html(`<strong>Success!!</strong> Delete Successful.`)
        $('#successAlert').show()
    })

}

function addWordTOLesson(){
    db.collection("/Words/"+$('#allSectionSelect').val()+"/Options/"+$('#allOptionSelect').val()+"/Words").add({
        addTime: firebase.firestore.Timestamp.now(),
        symbol: $('#symbol').val(),
        name: $('#name').val(),
        meaning: $('#meaning').val()
    }).then(doc => {
        $('#successAlert').html(`<strong>Success!!</strong> Update Successful.`)
        $('#successAlert').show()
        $('#symbol').val('')
        $('#name').val('')
        $('#meaning').val('')
    });
}


window.addEventListener("keydown", event => {
    if (event.code == "Space") {
        run=false
    }
    if (event.code == "Enter") {
        skip=true;leftSkip=false
    }
});


window.addEventListener("keyup", event => {
    if (event.code == "Space") {
        run=true
    }
    if (event.code == "Enter") {
        leftSkip=true
    }
});