var canvasWidth = 1400
var canvasHeight = 800
var fps = 60
var ballSpeed = -5
var tankSpeed = 10

var balls = []
var bricks = []
var brickNumber = 10

var imageFromPath = function(path) {
    var img = new Image()
    img.src = 'images/' + path
    return img
}

var randX = function() {
    return Math.random() * 1100 + 100
}

var randY = function() {
    return Math.random() * 280 + 20
}

var sleep = function(d) {
    for(var t=Date.now(); Date.now()-t <= d;);
}

var Rectangle = function(l, r, u, d) {
    var o = {
        left: l,
        right: r,
        up: u,
        down: d,
    }
    return o;
}

var Point = function(x1, y1) {
    var o = {
        x: x1,
        y: y1,
    }

    o.isInRect = function(rect) {
        return o.x > rect.left && o.x < rect.right && o.y > rect.up && o.y < rect.down
    }

    return o;
}

var rectIntersect = function(big, small) {
    var points = new Array()
    var tmp = Point(small.left, small.up)
    points.push(tmp)
    tmp = Point(small.left, small.down)
    points.push(tmp)
    tmp = Point(small.right, small.down)
    points.push(tmp)
    tmp = Point(small.right, small.down)
    points.push(tmp)
    for(var i=0; i<points.length; i++) {
        if(points[i].isInRect(big)) {
            console.log('collide')
            return true
        }
    }
    return false
}

var Tank = function() {

    image = imageFromPath('tank.png')
    var o = {
        image: image,
        x: 600,
        y: 620,
        speed: tankSpeed,
    }
    
    o.moveLeft = function() {
        o.x -= o.speed
    }

    o.moveRight = function() {
        o.x += o.speed
    }

    return o;
}

var Brick = function(nx, ny) {

    image = imageFromPath('brick.jpg')
    var o = {
        image: image,
        x: nx,
        y: ny,
        w: 191,
        h: 31,
        alive: true,
    }

    o.kill = function() {
        o.alive = false
    }

    return o;
}

var Ball = function() {

    var image = imageFromPath('ball.png')
    var o = {
        image: image,
        x: 0,
        y: 0,
        speedY: ballSpeed,
        fired: false,
    }
    
    o.fire = function(tx, ty) {
        o.fired = true
        o.x = tx
        o.y = ty
    }

    o.move = function() {
        if(o.fired) {
            if(o.y <=0 || o.y >= canvasHeight+o.image.height) {
                o.fired = false
            }
            o.y += o.speedY
        }
    }

    o.isFired = function() {
        return o.fired
    }

    o.collide = function(brick) {
        if(brick.alive == false) {
            return false
        }
        var rSmall = Rectangle(o.x, o.x+o.image.width, o.y, o.y+o.image.height)
        var rBig = Rectangle(brick.x, brick.x+brick.w, brick.y, brick.y+brick.h)
        return rectIntersect(rBig, rSmall)
    }

    return o;
}

var NewGame = function() {

    var o = {
        actions: {},  // actions[key] 存储key按下时要执行的函数
        keydowns: {}, // keydowns[key] 存储key是否按下
        ballsLeft: brickNumber,
    }

    canvas = document.querySelector('#id-canvas')
    context = canvas.getContext('2d')
    o.canvas = canvas
    o.context = context

    o.registerAction = function(key, func) {
        o.actions[key] = func
    }

    o.drawImage = function(obj) {
        // console.log('o.drawImage()')
        o.context.drawImage(obj.image, obj.x, obj.y)
    }

    window.addEventListener('keydown', function(event) {
        o.keydowns[event.key] = true
    })

    window.addEventListener('keyup', function(event) {
        o.keydowns[event.key] = false
    })

    setInterval(function() {
        var keys = Object.keys(o.actions)
        for(var i=0; i<keys.length; i++) {
            var key = keys[i]
            if(o.keydowns[key]) {
                o.actions[key]()
            }
        }

        o.update()
        context.clearRect(0, 0, canvas.width, canvas.height)
        o.draw()

    }, 1.0*1000/fps)

    return o;
}

var __main__ = function() {

    var game = NewGame()
    var tank = Tank()
    for(var i=0; i<brickNumber; i++) {
        var brick = Brick(randX(), randY())
        bricks.push(brick)
    }

    game.registerAction('a', function() {
        tank.moveLeft()
    })

    game.registerAction('d', function() {
        tank.moveRight()
    })

    game.registerAction(' ', function() {
        if(game.ballsLeft > 0) {
            var ball = Ball()
            balls.push(ball)
            balls[balls.length-1].fire(tank.x+tank.image.width/2-12, tank.y)
            game.keydowns[' '] = false
            game.ballsLeft--
        }            
    })

    game.update = function() {
        for(var i=0; i<balls.length; i++) {
            balls[i].move()
            if(balls[i].isFired()) {
                for(var j=0; j<bricks.length; j++) {
                    if(balls[i].collide(bricks[j])) {
                        balls[i].fired = false
                        bricks[j].kill()                        
                        continue
                    }
                }                    
            }
        }
    }
    
    game.draw = function() {
        game.drawImage(tank)
        for(var j=0; j<bricks.length; j++) {
            if(bricks[j].alive) {
                game.drawImage(bricks[j])
            }
        }
                   
        for(var i=0; i<balls.length; i++) {
            if(balls[i].isFired()) {
                game.drawImage(balls[i])
            }
        } 
    }
}

