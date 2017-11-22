var log = console.log.bind(console)


var canvasWidth = 1400
var canvasHeight = 572
var cardWidth = 115
var cardHeight = 175
var Scramble_Times = 20
var ifScramble = true
var iniMoney = 20000

var quitPath = './public/images/cards/quit.jpg'
var backPath = './public/images/cards/back.jpg'
var dealerPath = './public/images/cards/dealer.jpg'

var Level = []

var LevelInitialize = function() {
    var i = 1
    Level['highCard'] = i++
    Level['onePair'] = i++
    Level['twoPairs'] = i++
    Level['threeOfAKind'] = i++
    Level['straight'] = i++         //顺子
    Level['flush'] = i++            //同花
    Level['fullHouse'] = i++        //三带二
    Level['fourOfAKind'] = i++
    Level['straightFlush'] = i++
}

var imageFromPath = function(path) {
    var img = new Image()
    img.src = path
    return img
}

var imagePath = function(su, num) {
    //
    return './public/images/cards/' + su + num.toString() + '.jpg'
}

Array.prototype.removeByValue = function(val) {
    for(var i=0; i<this.length; i++) {
        if(this[i] == val) {
            this.splice(i, 1)
            break
        }
    }
}

var randomCompare = function(card1, card2) {
    // random() return [0,1); round四舍五入
    return Math.round(Math.random())
}

var numberDescending = function(c1, c2) {
    //
    return c1.number < c2.number
}

var intDescending = function(int1, int2) {
    //
    return int1 < int2
}

var IsFlush = function(suitTimes, cards) {
    
    var o = {
        level: 0,
        tmpCards: [],
    }
    var keys = Object.keys(suitTimes)
    var finalSuit = 0
    for(var i=0; i<keys.length; i++) {
        var suit = keys[i]
        if(suitTimes[suit] >= 5) {
            o.level = Level['flush']
            finalSuit = suit
            break
        }
    }
    if(o.level == Level['flush']) {
        cards.sort(numberDescending)
        var index = 0
        for(var i=0; i<cards.length && index<5; i++) {
            if(cards[i].suit == finalSuit) {
                o.tmpCards[index] = cards[i].number
                index++
            }
        }
    }

    return o
}

var IsStraight = function(numberTimes) {

    var o = {
        level: 0,
        tmpCards: [],
    }
    var keys = Object.keys(numberTimes)         // keys[0 1 2 3 4 5 6]
    if(keys[keys.length-1] == 14) {         // if there is A, consider both A2345 and 10JQKA
        var arr = ["1"]
        keys = arr.concat(keys)
    }
    // log(keys)
    var maxCardNumber = 0;
    for(var i=0; i < keys.length-4; i++) {  // 0 1 2
        var isStraight = true
        for(var j=0; j<4; j++) {            // 0 1 2 3
            var nw = parseInt(keys[i+j])
            var nxt = parseInt(keys[i+j+1])
            if(nw+1 != nxt) {
                isStraight = false
                break
            }
        }
        if(isStraight) {
            o.level = Level['straight']
            maxCardNumber = Math.max(parseInt(keys[i+4]), maxCardNumber)
        }
    }
    if(o.level == Level['straight']) {
        o.tmpCards.push(maxCardNumber)
    }
    return o
}

var IsStraightFlush = function(cards) {

    var o = {
        level: 0,
        tmpCards: [],
    }

    if(cards.toString() == "") {
        return o
    }

    cards.sort(numberDescending)
    var maxCardNumber = 0
    for(var i=0; i < cards.length-4; i++) {
        var isStraightFlush = true
        for(var j=0; j<4; j++) {
            var nw = cards[i+j].number
            var nxt = cards[i+j+1].number
            if(nxt != nw-1) {
                isStraightFlush = false
                break
            } else {
                var nS = cards[i+j].suit
                var nxtS = cards[i+j+1].suit
                if(nS != nxtS) {
                    isStraightFlush = false
                    break
                }
            }
        }
        if(isStraightFlush) {
            o.level = Level['straightFlush']
            maxCardNumber = Math.max(cards[i], maxCardNumber)
        }
    }
    if(o.level == Level['straightFlush']) {
        o.tmpCards.push(maxCardNumber)
    }
    return o
}

var IsOther = function(numberTimes) {

    var o = {
        level: 0,
        tmpCards: []
    }

    var dou = [], tri = [], qua = []

    var getLength = function() {
        var ld = dou.length.toString()
        var lt = tri.length.toString()
        var lq = qua.length.toString()
        return ld + lt + lq
    }

    var cards = Object.keys(numberTimes)
    for(var i=0; i<cards.length; i++) {
        var card = cards[i]
        var num = parseInt(card)
        if(numberTimes[card] == 2) {
            dou.push(num)
        }
        if(numberTimes[card] == 3) {
            tri.push(num)
        }
        if(numberTimes[card] == 4) {
            qua.push(num)
        }
        cards[i] = num
    }

    //determine specific level:
    if(true) {
        //
        cards.sort(intDescending)
        var len = getLength()
        if(len == "000") {
            
            o.level = Level['highCard']
            o.tmpCards = cards.slice(0,5) // get first 5 elements

        } else if(len == "100") {
            
            o.level = Level['onePair']
            o.tmpCards.push(dou[0])
            cards.removeByValue(dou[0])
            o.tmpCards = o.tmpCards.concat(cards.slice(0,3))
            
        } else if(len == "200" || len == "300") {  // 2 pairs (2*3 > 5)
            
            o.level = Level['twoPairs']
            dou.sort(intDescending)
            o.tmpCards.push(dou[0])            
            o.tmpCards.push(dou[1])       
            cards.removeByValue(dou[0])            
            cards.removeByValue(dou[1])
            o.tmpCards = o.tmpCards.concat(cards.slice(0,1))

        } else if(len == "010") {
            
            o.level = Level['threeOfAKind']
            o.tmpCards.push(tri[0])
            cards.removeByValue(tri[0])
            o.tmpCards = o.tmpCards.concat(cards.slice(0,2))

        } else if(len == "110" || len == "210" || len == "020") { // 2+3+x+x || 2+2+3 || 3+3+x
            
            o.level = Level['fullHouse']
            tri.sort(intDescending)
            o.tmpCards.push(tri[0])
            if(dou.length) {
                dou.sort(intDescending)
                o.tmpCards.push(dou[0])
            } else {
                o.tmpCards.push(tri[1])
            }

        } else if(len == "001" || len == "101" || len == "011") {
            
            o.level = Level['fourOfAKind']
            o.tmpCards.push(qua[0])
            cards.removeByValue(o.quarticNumber[0])
            o.tmpCards = o.tmpCards.concat(cards.slice(0,1))
        }
    }
    
    return o
}

var getPlayerXY = function(p) {
    var o = {
        x: p.x,
        y: p.y,
    }
    return o
}
var pushPlayer = function(p, winners) {
    var o = getPlayerXY(p)
    if(winners.indexOf(o) == -1) {
        winners.push(o)
    }
}
// descending
var playerCmp = function(p1, p2) {
    if(p1.level != p2.level) {
        return p1.level < p2.level
    }
    // players have the same card level:
    for(var i=0; i<p1.decisiveCards.length; i++) {
        if(p1.decisiveCards[i] != p2.decisiveCards[i]) {
            return p1.decisiveCards[i] < p2.decisiveCards[i]
        }
    }
    
    return true
}

var PokerCard = function(su, num) {
    var path = imagePath(su, num)
    var o = {
        number: num, // int
        suit: su,    // char
        imagePath: path
    }

    return o;
}

var CardPile = function(pileSize = 1) {
    var cardNumber = [2,3,4,5,6,7,8,9,10,11,12,13,14]
    var cardSuit = ['d','s','h','c']
    var cards = []
    // 获得整齐的牌堆
    while(pileSize--) {
        for(var i=0; i<52; i++) {
            var suit = cardSuit[parseInt(i / 13)]
            var number = cardNumber[i % 13]
            // console.log(suit,number)
            var tmp = PokerCard(suit, number)
            cards.push(tmp)
        }
    }
    
    var o = {
        cards: cards,
        index: 0,
    }

    o.scramble = function() {
        for(var i=0; i<Scramble_Times; i++) {
            o.cards.sort(randomCompare)
        }
    }

    // take the first card from the card pile
    o.getOne = function() {
        var tmp = o.cards[o.index]
        o.index++
        return tmp
    }

    if(ifScramble) {
        o.scramble()
    }
       
    return o;
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
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            // console.log(card)
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

var Player = function(sx = 40, sy = 403, name = "") {

    var o = {
        x: sx, 
        y: sy,
        cards: [], // cards[0-6] = (PokerCard)
        level: 0,
        decisiveCards: [],
        playing: true,
        money: iniMoney,
    }

    o.ini = function() {
        o.cards = []
        o.level = 0
        o.decisiveCards = []
        o.playing = true
    }

    o.getOneFrom = function(pile) {   // var pile = CardPile(); var player = Player(); player.getOneFrom(pile);
        var tmp = pile.getOne()
        // log(tmp)
        o.cards.push(tmp)
    }

    o.showIn = function(view) {
        for(var i=0; i<o.cards.length; i++) {
            var card = o.cards[i]
            // console.log(card)
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

    o.showMoney = function(i) {
        var money = o.money.toString()
        var p = document.getElementById('p' + i + '-name')
        p.innerHTML = '<h2 class="inDiv" id="p' + i + '-money">' + money + '</h2>'
    }

    o.quit = function(view) {
        o.playing = false
        for(var i=0; i<o.cards.length; i++) {
            view.drawImage(quitPath, o.x + i * (cardWidth + 5), o.y)       
        }
    }

    o.merge = function(board) {       
        var cards = o.cards.concat(board.cards)
        // log(cards)
        var suitTimes = []
        var numberTimes = []
        for(var i=0; i<cards.length; i++) {
            if(typeof(suitTimes[cards[i].suit]) == 'undefined') {
                suitTimes[cards[i].suit] = 0
            }
            suitTimes[cards[i].suit]++
            if(typeof(numberTimes[cards[i].number]) == 'undefined') {
                numberTimes[cards[i].number] = 0
            }
            numberTimes[cards[i].number]++
        }
        // log(suitTimes)
        // log(numberTimes)

        var isFlush = IsFlush(suitTimes, cards)
        // log(isFlush)

        var isStraight = IsStraight(numberTimes)
        // log(isStraight)
        
        var isStraightFlush = IsStraightFlush([])
        if(isFlush.level == Level['flush'] && isStraight.level == Level['straight']) {
            isStraightFlush = IsStraightFlush(cards)
        }
        // log(isStraightFlush)

        // determine triples, doubles, etc
        var isOther = IsOther(numberTimes)
        // log(isOther)

        o.level = Math.max(isFlush.level, isStraight.level, isOther.level, isStraightFlush.level)
        
        if(o.level == isFlush.level) {
            
            o.decisiveCards = isFlush.tmpCards

        } else if(o.level == isStraight.level) {
            
            o.decisiveCards = isStraight.tmpCards
        
        } else if(o.level == isStraightFlush.level) {

            o.decisiveCards = isStraightFlush.tmpCards

        } else if(o.level == isOther.level) {
        
            o.decisiveCards = isOther.tmpCards
        
        }
    }

    o.moneyChange = function(num, i) {
        o.money -= num
        i = (i+1).toString()
        o.showMoney(i)
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

    o.holeCards = function(players, pile) {
        for(var i=0; i<2; i++) {
            for(var j=0; j<players.length; j++) {
                players[j].getOneFrom(pile)
            }
        }
    }

    o.showPlayers = function(players) {
        for(var i=0; i<players.length; i++) {
            if(players[i].playing) {
                players[i].showIn(this)
            }           
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
    LevelInitialize()

    return o;
}

var findWinners = function(players) {
    var winners = []
    players.sort(playerCmp)
    winners.push(getPlayerXY(players[0]))
    for(var i=1; i<players.length; i++) {
        if(players[i].level == players[0].level) {
            if(players[i].decisiveCards.toString() == players[0].decisiveCards.toString()) {
                winners.push(getPlayerXY(players[i]))
            }
        } else {
            break
        }
    }
    return winners
}







