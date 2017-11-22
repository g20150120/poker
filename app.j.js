var log = console.log.bind(console)
var port = 8000

var express = require('express')
var app = express()

var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer')
var path = require('path')

var http = require('http').Server(app)
var io = require('socket.io')(http)



// view engine setup
// app.set('views', path.join(__dirname, 'views'))
// app.set('view engine', 'jade')

// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(express.static(path.join(__dirname)))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res){
    // console.log(__dirname)
    // log('get /')
    res.sendFile(__dirname + '/views/resume.html');
});

app.get('/warplane', function(req, res) {
    res.sendFile(__dirname + '/views/warplane.html')
})


app.get('/poker', function(req, res) {
    var url = req.url;          //get whole url of the page
    url = decodeURI(url);       //decode url
    if(url.indexOf('?') == -1 || typeof(url.split('?')[1]) == 'undefined') { // if no para in url
        res.send('<center><h1>ERROR</h1></center>')
        return
    }
    //first split by '?', then split the second part by '=' to the string after '='
    var id = url.split('?')[1].split('=')[1];
    
    if(id == 'admin') {
        console.log('admin log in')
        // res.render('poker-admin')
        res.sendFile(__dirname + '/views/poker-admin.html')
    } else if(parseInt(id).toString() != 'NaN') { // if id is a number
        console.log('user' + id + ' log in')
        // res.render('poker-user', {"playerID": id})
        res.sendFile(__dirname + '/views/poker-user' + id + '.html')
    } else {
        res.send('<center><h1>ERROR</h1></center>')
    }
})

io.on('connection', function(socket){
    socket.on('playerName', function(obj){
        // console.log('playerName', obj)
        io.emit('playerName', obj)
    })
    socket.on('playerQuit', function(i) {
        // console.log('playerQuit', i)
        io.emit('playerQuit', i)
    })
    socket.on('playerBet', function(obj) {
        // console.log('playerBet', obj)
        io.emit('playerBet', obj)
    })
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
app.post('/contact_process', function(req,result){
  
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
    to: 'alexzhaojc@126.com',
    subject: mailSubject,
    text: "From " + req.body.contactEmail + ':\n\n' + req.body.contactMessage
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
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  });
  result.redirect('/#contact');
});

http.listen(port, function(){
    console.log('listening on port ' + port.toString())
})
















