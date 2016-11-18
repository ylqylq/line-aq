// user.js

$('#goBack').click(function(){
    history.go(-1)
})

$('form').submit(function(ev){
    ev.preventDefault()
    
    var data = new FormData(this)
    
    $.post({
        url: '/user/photo',
        data: data,
        contentType : false,
        processData: false,
        success: function(res){
            if(res.code == 'success'){
                location.href = 'index.html'
            }
            else{
                $('.modal-body').text(res.message)
                $('.modal').modal('show')
            }
        }
    })
})