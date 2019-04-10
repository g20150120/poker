var log = console.log.bind(console)
var port = 3000

var express = require('express')
var app = express()

var favicon = require('serve-favicon');

var credentials = require('./credentials.js');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer')
var path = require('path')

var http = require('http').Server(app)
var io = require('socket.io')(http)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieSecret));

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
// app.use(express.static(path.join(__dirname)))
app.use(express.static(path.join(__dirname, 'public')))

// send homepage
app.get('/', function(req, res){
    
    res.sendFile(__dirname + '/views/resume.html');

});

// play warplane
app.get('/warplane', function(req, res) {
    
    res.sendFile(__dirname + '/views/warplane.html')

})

var flag = [false, true, true, true]

app.get('/poker', function(req, res) {

    var url = req.url;          //get whole url of the page
    url = decodeURI(url);       //decode url
    if(url.indexOf('?') == -1 || typeof(url.split('?')[1]) == 'undefined') { // if no para in url       
        res.clearCookie('pwd');
        res.sendFile(__dirname + '/views/poker-home.html')
        return   
    }
    //first split by '?', then split the second part by '=' to the string after '='
    var id = url.split('?')[1].split('=')[1];
    
    if(id == 'admin') {
        // log(req.cookies)
        if(req.cookies.pwd != '$2a$10$kJY.MH4EcVoUOGV3Vgfi/eme.nOjll3LrQa43DuKZoU6DqMoUWwDa') {
            res.send('<center><h1>404</h1></center>')
            return
        }
        flag = [false, true, true, true]
        res.sendFile(__dirname + '/views/poker-adminHome.html')

    } else if(id == 'start') {
        if(req.cookies.pwd != '$2a$10$kJY.MH4EcVoUOGV3Vgfi/eme.nOjll3LrQa43DuKZoU6DqMoUWwDa') {
            res.send('<center><h1>404</h1></center>')
            return
        }
        res.sendFile(__dirname + '/views/poker.html')
    } else if(id == 'player') { // if id is a number
        for(var i=1; i<flag.length; i++) {
            if(flag[i]) {
                flag[i] = false
                res.render('poker', {"playerID": i})
                return
            }
        }
        res.render('poker', {"playerID": 4})
        
    } else {       
        res.send('<center><h1>ERROR</h1></center>')
    }

})

app.post('/poker_process', function(req, res) {
    var pwd = req.body.pwd
    if(pwd == 'alexzhaojc') {
        res.cookie('pwd','$2a$10$kJY.MH4EcVoUOGV3Vgfi/eme.nOjll3LrQa43DuKZoU6DqMoUWwDa')
        res.redirect('/poker?id=admin')
        return
    } else {
        res.send('<center><h1>404</h1></center>')
        return
    }
})

io.on('connection', function(socket){
    
    socket.on('exeCom', function(obj) {
        // console.log('exeCom', obj.com)
        io.emit('exeCom', obj)
    })
})

//handle the request to download pdf
app.get('/downloadPDF', function(req,res){
  
    // /downloadPDF?id=fileName
    var thisURL=decodeURI(req.url);
    var fileName=thisURL.split('?')[1].split('=')[1];
    var tmpFile="/download/" + fileName + ".pdf";
    res.redirect(tmpFile);

});

//handle the request to download txt
app.get('/downloadCPP', function(req,res){
  
    // /downloadPDF?id=fileName
    var thisURL=decodeURI(req.url);
    var fileName=thisURL.split('?')[1].split('=')[1];
    var tmpFile="/download/" + fileName + ".cpp";
    res.redirect(tmpFile);

});

//handle the post of contactFForm and send email using nodemailer
cnt = 0
msg = ""
app.post('/contact_process', function(req,result){
  
  msg += req.body.contactSubject + " from " + req.body.contactName + ": "
  msg += "From " + req.body.contactEmail + ': ' + req.body.contactMessage
  msg += '\n\n\n'
  cnt++

  if(cnt == 10 || req.body.contactMessage == "Alexander Zhao overriding") {
    
    let transporter = nodemailer.createTransport({
      //service: "hotmail",
      host: "smtp.qq.com",
      port: 465,
      secureConnection: true,
      auth:
      {
        user: "1467222535@qq.com",
        pass: "pziglqgwycctifhd"
      }
    });
    // console.log(req.body)
    var mailSubject = req.body.contactSubject + " from " + req.body.contactName;

    let mailOptions = {
      from: "alexanderzhao.info  <1467222535@qq.com>",
      to: 'alexzhaojc@gmail.com',
      subject: "Recent messages from alexanderzhao.info",
      text: msg
    };

    transporter.sendMail(mailOptions, (err,info)=>{
      if(err)
      {
        console.log(err);
        //res.render('error');
      }
      else
      {
        console.log('Message sent: %s', info.messageId);
      }
    });
    cnt = 0
    msg = ""
  }
  
  result.redirect('/#contact');
});

http.listen(port, function(){
    console.log('listening on port ' + port.toString())
})
















