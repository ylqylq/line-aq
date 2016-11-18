// index.js

// 
var username = $.cookie('username');
// 如果用户存在把"用户名"显示到最后一个span内
if(username){
    // last()获取最后一个元素
    $('#user').find('span').last().text(username);
}else{
    // 用户不存在(即没有用户登录)就跳转到登录页面
    // end()回到最近的一个"破坏性"操作之前。即，将匹配的元素列表变为前一次的状态。
    $('#user').find('span').last().text('登录').end().end().removeAttr('data-toggle').click(function(){
        location.href = 'signin.html';
    })
}
// 点击"提问"
$('#ask').click(function(){
    if(username){
        location.href = 'ask.html';
    }else location.href = 'signin.html';
})

// 点击"退出"
$('.navbar .dropdown-menu li').last().click(function(){
    $.get('/user/signout', null, function(res){
        if(res.code == 'success'){
            location.href = 'index.html';
        }
    })
})

// delegate():指定的元素（属于被选元素的子元素）添加一个或多个事件处理程序，并规定当这些事件发生时运行的函数。
// jquery-3.0已弃用，请用on()方法代替
$('.questions').delegate('[question]', 'click', function(){
    if(username){
        $.cookie('question', $(this).attr('question'));
        location.href = 'answer.html';
    }else{
        location.href = 'signin.html';
    }
})

// 从/questions中解析数据
$.getJSON('/questions', null, function(res){
    var html = '';
    for(var i = 0; i < res.data.length; i++){
        var q = res.data[i];
        html += '<div class="media" question="' + new Date(q.time).getTime() + '">';
        html += '<div class="media-left">';
        html += '<a>';
        html += '<img class="media-object" src="/upload/' + q.username + '.jpg" onerror="this.src=\'/images/user.png\'">';
        html += '</a>';
        html += '</div>';
        html += '<div class="media-body">';
        html += '<h4 class="media-heading">' + q.username + '</h4>';
        html += q.content;
        html += '<div class="media-footing">';
        html +=  formatDateTime(new Date(q.time));
        html += '</div>';
        html += '</div>';
        html += '</div>';
        
        if(q.answers){
            for(var j = 0; j < q.answers.length; j++){
                var a = q.answers[j];
                html += '<div class="media media-child">';
                html += '<div class="media-body">';
                html += '<h4 class="media-heading">' + a.username + '</h4>';
                html += a.content;
                html += '<div class="media-footing">';
                html +=  formatDateTime(new Date(a.time));
                html += '</div>';
                html += '</div>';
                html += '<div class="media-right">';
                html += '<a>';
                html += '<img class="media-object" src="/upload/' + a.username + '.jpg" onerror="this.src=\'/images/user.png\'">';
                html += '</a>';
                html += '</div>';
                html += '</div>';
            }
        }
    }
    // "问题"和"回答"显示到页面上
    $('.questions').html(html);
})
// 格式化日期时间
function formatDateTime(t){
    var M = t.getMonth() + 1,
        d = t.getDate(),
        h = t.getHours(),
        m = t.getMinutes()

    M = M < 10 ? '0' + M : M;
    d = d < 10 ? '0' + d : d;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    
    return t.getFullYear() + '-' + M + '-' + d + ' ' + h + ':' + m;
}
// 格式化ip
function formatIP(ip){
    if(ip.startsWith('::1')){
        return '127.0.0.1'
    }
    if(ip.startsWith('::ffff:')){
        return ip.substr(7)
    }
}