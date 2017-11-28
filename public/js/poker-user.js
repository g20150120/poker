var log = console.log.bind(console)


var canvasWidth = 1400
var canvasHeight = 572
var cardWidth = 115
var cardHeight = 175
var iniMoney = 20000

var quitPath = 'quit'
var backPath = 'back'
var dealerPath = 'dealer'

var imageFromPath = function(path) {
    var img = new Image()
    img.src = './images/cards/' + path + '.jpg'
    img.alt = path
    return img
}

var Board = function(sx = 400, sy = 3) {

    var o = {
        x: sx,
        y: sy,
        cards: [],
    }

    o.getXFrom = function(x, pile) {
        for(var i=0; i<x; i++) {
            var tmp = pile.getOne()
            o.cards.push(tmp)
        }
    }

    o.showIn = function(view) {
        var msg = 'board:'
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            msg = msg + ' ' + card.imagePath
        }
        alert(msg)
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            view.drawImage(card.imagePath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    o.showBack = function(view) {
        for(var i=0; i<5; i++) {
            view.drawImage(backPath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    return o;
}

var Player = function(sx = 40, sy = 403) {

    var o = {
        x: sx, 
        y: sy,
        cards: [], // cards[0-6] = (PokerCard)
        money: iniMoney,
    }

    o.ini = function() {
        o.cards = []
    }

    o.getOneFrom = function(pile) {   // var pile = CardPile(); var player = Player(); player.getOneFrom(pile);
        var tmp = pile.getOne()
        // log(tmp)
        o.cards.push(tmp)
    }

    o.showIn = function(view) {
        var msg = 'player:'
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            msg = msg + ' ' + card.imagePath
        }
        alert(msg)
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            view.drawImage(card.imagePath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    o.showBack = function(view) {
        for(var i=0; i<2; i++) {
            view.drawImage(backPath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    o.showDealer = function(view) {
        view.drawImage(dealerPath, o.x, o.y - 45)
    }

    o.showName = function(name) {
        view.writeText(name, o.x + 60, o.y - 15, "40px Helvetica", "black")
    }

    o.showMoney = function(id) {
        var money = o.money.toString()
        var p = document.getElementById(id + '-name')
        p.innerHTML = '<h2 class="inDiv" id="' + id + '-money">' + money + '</h2>'
    }

    o.quit = function(view) {
        for(var i=0; i<2; i++) {
            // log('o.quit()')
            view.drawImage(quitPath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    o.moneyChange = function(num, i) {
        o.money -= num
        var id = i.toString()
        o.showMoney(id)
    }

    return o;
}

var View = function() {

    canvas = document.querySelector('#id-canvas')
    context = canvas.getContext('2d')
    var o = {
        canvas: canvas,
        context: context,
    }

    o.clear = function(x, y, w, h) {
        o.context.fillStyle = "white"
        o.context.fillRect(x, y, w, h)
    }

    o.drawImage = function(path, x, y) {
        var img = imageFromPath(path)
        img.onload = function() {
            o.context.drawImage(img, x, y)
        }        
    }

    o.showPlayers = function(players) {
        for(var i=0; i<players.length; i++) {
            players[i].showIn(this)        
        }
    }

    o.quitPlayer = function(player) {
        player.quit(this)
    }

    o.showBoard = function(board) {
        board.showIn(this)
    }

    o.writeText = function(txt, x, y , font = "20px Helvetica-light", style = "blue") {
        //设置字体样式
        // o.context.font = "30px Courier New"
        o.context.font = font
        //设置字体填充颜色
        o.context.fillStyle = style
        //从坐标点(50,50)开始绘制文字
        o.context.fillText(txt, x, y)
    }

    o.printWinners = function(winners) {
        for(var i=0; i<winners.length; i++) {
            o.writeText("Winner", winners[i].x + 60, winners[i].y - 80, "40px Helvetica")
        }
    }
    
    o.clear(0, 0, canvasWidth, canvasHeight)
    return o;
}






