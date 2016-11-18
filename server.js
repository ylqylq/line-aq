// server.js 

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const multer = require('multer');

// 设置上传文件参数
const storage = multer.diskStorage({
    // 上传路径
    destination:'wwwroot/upload',
    // 上传后文件重命名
    filename:function(req, file, callback){
        var username = req.cookies.username;
        callback(null, `${username}.jpg`);
    }
})
// 把上传参数设置为multer的一个对象
var uploads = multer({storage});

var app = express();
app.use(express.static('wwwroot'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

// 注册
app.post('/user/register', (req, res)=>{
    req.body.ip = req.ip;
    req.body.time = new Date();
    
    function send(code, message){
        res.status(200).json({code, message});
    }
    // saveFile()用来保存文件
    function saveFile(){
        var fileName = `users/${req.body.username}.txt`;
        
        fs.exists(fileName, (exists)=>{
            if(exists){
                send('registered', '用户已经注册过了');
            }else{
                fs.appendFile(fileName, JSON.stringify(req.body), (err)=>{
                    if(err){
                        send('file error', '抱歉，系统错误');
                    }else send('success', '恭喜，注册成功！请登录...');
                })
            }
        })
    }
    // 判断users目录是否存在
    fs.exists('users', (exists)=>{
        if(exists){
            saveFile();
        }else{
            fs.mkdir('users', (err)=>{
                if(err){
                    send('file error', '抱歉，系统错误...');
                }else saveFile();
            })
        }
    })
})

// 登录
app.post('/user/signin', (req, res)=>{
    var fileName = `users/${req.body.username}.txt`;
    
    function send(code, message) {
        res.status(200).json({code, message});
    }
    
    fs.exists(fileName, (exists)=>{
        if(exists){
            fs.readFile(fileName, (err, data)=>{
                if(err){
                    send('file error', '抱歉，系统错误');
                }else{
                    var user = JSON.parse(data);
                    if(user.password == req.body.password){
                        res.cookie('username', req.body.username);
                        send('success', '登录成功');
                    }else send('signin error', '用户名或密码错误!!!');
                }
            })
        }else send('register error', '用户未注册');
    })
})

// 退出
app.get('/user/signout', (req, res)=>{
    res.clearCookie('username');
    res.status(200).json({code:'success'});
})

// 提问
app.post('/ask', (req, res)=>{
    // 从cookie中读取已经登录的用户名
    var username = req.cookies.username;
    
    function send(code, message) {
        res.status(200).json({code, message});
    }
    // 如果cookie中没有该用户，说明没有登录
    if(!username){
        send('signin error', '请重新登录');
        return;
    }
    
    var time = new Date();
    // 把username ip time放入req.body中
    req.body.username = username;
    req.body.ip = req.ip;
    req.body.time = time;
    // saveFile()保存提问的问题
    function saveFile() {
        // 命名『问题』文件
        var fileName = `questions/${time.getTime()}.txt`;
        // 把req.body的内容写入txt文件
        fs.appendFile(fileName, JSON.stringify(req.body), (err)=>{
            if(err){
                send('file error', '抱歉，系统错误...');
            }else send('success', '问题提交成功');
        })
    }
    // 判断questions是否存在
    fs.exists('questions', (exists)=>{
        if(exists){
            saveFile()
        }else{
            fs.mkdir('questions', (err)=>{
                if(err){
                    send('file error', '抱歉，系统错误');
                }else saveFile();
            })
        }
    })
})

// 上传头像
app.post('/user/photo', uploads.single('photo'), (req, res)=>{
    res.status(200).json({code:'success', message:'上传成功'});
})

// 首页
app.get('/questions', (req, res)=>{
    function send(code, message, data) {
        res.status(200).json({code, message, data});
    }
    // 读取文件内容
    function readFiles(i, files, questions, complete) {
        if(i < files.length){
            fs.readFile(`questions/${files[i]}`, (err, data)=>{
                if(!err){
                    questions.push(JSON.parse(data));
                }
                readFiles(++i, files, questions, complete);
            })
        }else complete();
    }
    
    fs.readdir('questions', (err, files)=>{
        if(err){
            send('file error', '抱歉，系统错误');
        }else{
            // 反转数组，为了把最新的数据显示到上面
            files = files.reverse();
            var questions = [];
            
            readFiles(0, files, questions, function(){
                send('success', '读取数据成功', questions);
            })
        }
    })
})

// 回答
app.post('/answer', (req, res)=>{
    var username = req.cookies.username;
    
    function send(code, message) {
        res.status(200).send({code, message});
    }
    // 判断是否登录
    if(!username){
        send('signin error', '请重新登录');
        return;
    }
    console.log(req.body);
    
    var fileName = `questions/${req.body.question}.txt`;
    
    req.body.username = username;
    req.body.ip = req.ip;
    req.body.time = new Date();
    // 读取文件内容
    fs.readFile(fileName, (err, data)=>{
        if(err){
            send('file error', '抱歉，系统错误!!!');
        }else{
            // 把文件内容转换为json
            var question = JSON.parse(data);
            // 判断文件中是否有"answers"，如果没有就添加,answers第一次是一个空数组
            if(!question.answers) question.answers = [];
            // 添加answers后，把回答的内容放入answers,这样就把"回答"附加到"问题"后面了
            question.answers.push(req.body);
            
            // 把question写入文件
            fs.writeFile(fileName, JSON.stringify(question), (err)=>{
                if(err){
                    send('file error', '抱歉，系统错误');
                }else send('success', '回答提交成功');
            })
        }
    })
})

// 监听
app.listen(3000, ()=>{console.log('server is running...')});