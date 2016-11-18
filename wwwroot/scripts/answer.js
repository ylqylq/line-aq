// answer.js

$('#goBack').click(function(){
    history.go(-1)
})

var question = $.cookie('question')

$('form').submit(function(ev){
    ev.preventDefault()
    
    var formData = $(this).serializeArray()
    formData.push({
        name: 'question',
        value: question
    })

    $.post('/answer', formData, function(res){
        $('.modal-body').text(res.message)
        $('.modal').modal('show')
        .on('hidden.bs.modal', function (e) {
            if(res.code == 'success'){
                location.href = 'index.html'
            }
        })
    }, 'json')
})