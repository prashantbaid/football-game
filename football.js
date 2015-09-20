var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var x = canvas.width / 2;
var y = canvas.height / 2;
var ballRadius = 6;
var dx = 3;
var dy = -3;
var m = 0;
var j = 0;
var paddleHeight = 10;
var paddleWidth = 30;
var paddleX = (canvas.width - paddleWidth);
var rightPressed = false;
var leftPressed = false;
var goalpostWidth = 150;
var goalpostHeight = 10;
var homeScore = 0;
var awayScore = 0;
var rightPressedAway = false;
var leftPressedAway = false;
var playerHeight = 50;
var playerWidth = 30;
var initFlag = true;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

var V = SAT.Vector;
var C = SAT.Circle;
var B = SAT.Box;
var drawFlag = 1;
var circle;
var box;
var gameOver = false;
var homePlayer = new Image();
var awayPlayer = new Image();

function init() {
    removeStatus();
    homePlayer.src = 'homePlayer.png';
    awayPlayer.src = 'awayPlayer.png';
    document.getElementById('startScreen').style['z-index'] = '-1';
    document.getElementById('gameOverScreen').style['z-index'] = '-1';
    document.getElementById('home').innerHTML = '0';
    document.getElementById('away').innerHTML = '0';
    removeStatus();
    awayScore = 0;
    homeScore = 0;
    gameOver = 0;
    setInitialDelay();
}

function setInitialDelay() {
    setTimeout(function() {
        drawFlag = 1;
        window.requestAnimationFrame(draw);
        startTimer(60 * 2);
    }, 1500);
}

function setDelay() {
    setTimeout(function() {
        drawFlag = 1;
        window.requestAnimationFrame(draw);
    }, 1500);
}
var countdown;

function startTimer(duration) {
    var timer = duration,
        minutes, seconds;
    countdown = setInterval(function() {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById('countdown').innerHTML = minutes + ":" + seconds;

        if (--timer < 0) {
            document.getElementById('gameOverScreen').style['z-index'] = 3;
            gameOver = true;
            clearInterval(countdown);
            if (homeScore > awayScore)
                updateStatus('GAME OVER!<br>Juventus Win!');
            else if (awayScore > homeScore)
                updateStatus('GAME OVER!<br>Liverpool Win!');
            else
                updateStatus('GAME OVER!<br>Draw!')
        }
    }, 1000);
}


function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    circle = new C(new V(x, y), 6);
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
    }

}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPlayers();
    drawGoalPost();
    x += dx;
    y += dy;
    if (rightPressed && paddleX * 3 / 4 + m < canvas.width - paddleWidth) {
        m += 2;
    } else if (leftPressed && paddleX / 4 + m > 0) {
        m -= 2;
    }
    if (drawFlag && !gameOver)
        window.requestAnimationFrame(draw);
}

function updateScore(goal) {

    if (goal === 'home') {
        awayScore += 1;
        document.getElementById('away').innerHTML = awayScore;
    } else {
        homeScore += 1;
        document.getElementById('home').innerHTML = homeScore;
    }
}

function resetBall() {
    x = canvas.width / 2;
    y = canvas.height / 2;
    drawBall();
    drawFlag = 0;
    window.requestAnimationFrame(draw);

}

function updateStatus(message) {
    document.getElementById('status').innerHTML = message;

}

function removeStatus() {
    setTimeout(function() {
        document.getElementById('status').innerHTML = '';
    }, 1500);
}

function drawGoalPost() {

    //home
    ctx.beginPath();
    var gphX = (canvas.width - goalpostWidth) / 2;
    var gphY = canvas.height - goalpostHeight;
    ctx.rect(gphX, gphY, goalpostWidth, goalpostHeight);
    ctx.fillStyle = "#9C9C9C";
    ctx.fill();
    ctx.closePath();
    box = new B(new V(gphX, gphY), goalpostWidth, goalpostHeight).toPolygon();
    if (goalDetection(box)) {
        updateScore('home');
        updateStatus('GOAL!<br>Juventus Score!');
        removeStatus();
        resetBall();
        setDelay();
    }
    //away
    ctx.beginPath();
    var gpaX = (canvas.width - goalpostWidth) / 2;
    var gpaY = paddleHeight - goalpostHeight;
    ctx.rect(gpaX, gpaY, goalpostWidth, goalpostHeight);
    ctx.fillStyle = "#9C9C9C";
    ctx.fill();
    ctx.closePath();

    box = new B(new V(gpaX, gpaY), goalpostWidth, goalpostHeight).toPolygon();
    if (goalDetection(box)) {
        updateScore('away');
        updateStatus('GOAL!<br>Liverpool Score!');
        removeStatus();
        resetBall();
        setDelay();
    }
}

function goalDetection(box) {
    var response = new SAT.Response();
    return SAT.testPolygonCircle(box, circle, response);
}


function drawGoalkeeper() {
    console.log('called');
    ctx.beginPath();
    var gkX = paddleX / 2 + m;
    var gkY = canvas.height * 7 / 8 - paddleHeight;
    ctx.drawImage(homePlayer, gkX, gkY - 15, playerWidth, playerHeight);
    ctx.rect(0, gkY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    box = new B(new V(gkX, gkY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, gkX);

}

var flag1 = 1;
var flag2 = 1;

function collisionDetection(box, pX) {
    var response = new SAT.Response();
    if (SAT.testPolygonCircle(box, circle, response)) {
        var speed = (x + (12 / 2) - pX + (20 / 2)) / (20 / 2) * 5;
        if (flag1 == 1) {
            if (dy > 0) {
                dy = -dy;
                y = y - speed;
                if (dx > 0)
                    x = x + speed;
                else
                    x = x - speed;
            } else {
                y = y - speed;
                if (dx > 0)
                    x = x - speed;
                else
                    x = x + speed;
            }
            flag1 = 0;
        }
    } else
        flag1 = 1;
}

function collisionDetectionAway(box) {
    var response = new SAT.Response();
    if (SAT.testPolygonCircle(box, circle, response)) {
        if (flag2 == 1) {
            if (dy < 0) {
                dy = -dy;
                y = y + 5;
                if (dx > 0)
                    x = x + 5;
                else
                    x = x - 5;
            } else {
                y = y + 5;
                if (dx > 0)
                    x = x + 5;
                else
                    x = x - 5;
            }
        }
    } else
        flag2 = 1;
}


function drawDefenders() {

    ctx.beginPath();
    var lcbX = paddleX / 4 + m;
    var lcbY = canvas.height * 13 / 16 - paddleHeight;
    ctx.rect(0, lcbY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(homePlayer, lcbX, lcbY - 15, playerWidth, playerHeight);
    box = new B(new V(lcbX, lcbY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, lcbX);

    var rcbX = paddleX * 3 / 4 + m;
    var rcbY = canvas.height * 13 / 16 - paddleHeight;
    ctx.drawImage(homePlayer, rcbX, rcbY - 15, playerWidth, playerHeight);
    box = new B(new V(rcbX, rcbY), playerWidth, paddleHeight).toPolygon();

    collisionDetection(box, rcbX);
}

function drawMidfielders() {

    //midfielders
    ctx.beginPath();
    var lwbX = paddleX * 1 / 8 + m;
    var lwbY = canvas.height * 5 / 8 - paddleHeight;
    ctx.rect(0, lwbY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(homePlayer, lwbX, lwbY - 15, playerWidth, playerHeight);
    box = new B(new V(lwbX, lwbY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, lwbX);

    var lcmX = paddleX * 3 / 8 + m;
    var lcmY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(homePlayer, lcmX, lcmY - 15, playerWidth, playerHeight);
    box = new B(new V(lcmX, lcmY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, lcmX);

    var rcmX = paddleX * 5 / 8 + m;
    var rcmY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(homePlayer, rcmX, rcmY - 15, playerWidth, playerHeight);
    box = new B(new V(rcmX, rcmY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rcmX);

    var rwbX = paddleX * 7 / 8 + m;
    var rwbY = canvas.height * 5 / 8 - paddleHeight;
    ctx.drawImage(homePlayer, rwbX, rwbY - 15, playerWidth, playerHeight);
    box = new B(new V(rwbX, rwbY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rwbX);

}

function drawStrikers() {
    //attackers
    ctx.beginPath();
    var lwX = paddleX / 4 + m;
    var lwY = canvas.height * 9 / 32 - paddleHeight;
    ctx.rect(0, lwY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(homePlayer, lwX, lwY - 15, playerWidth, playerHeight);
    box = new B(new V(lwX, lwY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, lwX);

    ctx.beginPath();
    var cfX = paddleX / 2 + m;
    var cfY = canvas.height * 9 / 32 - paddleHeight;
    ctx.drawImage(homePlayer, cfX, cfY - 15, playerWidth, playerHeight);
    box = new B(new V(cfX, cfY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, cfX);

    ctx.beginPath();
    var rwX = paddleX * 3 / 4 + m;
    var rwY = canvas.height * 9 / 32 - paddleHeight;
    ctx.drawImage(homePlayer, rwX, rwY - 15, playerWidth, playerHeight);
    box = new B(new V(rwX, rwY), playerWidth, paddleHeight).toPolygon();
    collisionDetection(box, rwX);

}

function drawPlayers() {

    //home
    drawGoalkeeper();
    drawDefenders();
    drawMidfielders();
    drawStrikers();

    //away
    drawAwayGoalkeeper();
    drawAwayDefenders();
    drawAwayMidfielders();
    drawAwayStrikers();
}

function drawAwayGoalkeeper() {

    ctx.beginPath();
    var gkX = paddleX / 2 + j;
    var gkY = canvas.height * 1 / 8 - paddleHeight;
    ctx.rect(0, gkY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(awayPlayer, gkX, gkY - 15, playerWidth, playerHeight);
    box = new B(new V(gkX, gkY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    if (x > gkX && gkX < paddleX * 3 / 4)
        j += 1;
    else if (gkX > paddleX * 1 / 4)
        j -= 1;

}

function drawAwayDefenders() {

    ctx.beginPath();
    var lcbX = paddleX / 4 + j;
    var lcbY = canvas.height * 3 / 16 - paddleHeight;
    ctx.rect(0, lcbY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.strokeStyle = 'black';
    ctx.fill();
    ctx.stroke();

    ctx.closePath();
    ctx.drawImage(awayPlayer, lcbX, lcbY - 15, playerWidth, playerHeight);
    box = new B(new V(lcbX, lcbY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var rcbX = paddleX * 3 / 4 + j;
    var rcbY = canvas.height * 3 / 16 - paddleHeight;
    ctx.drawImage(awayPlayer, rcbX, rcbY - 15, playerWidth, playerHeight);
    box = new B(new V(rcbX, rcbY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    if (x > lcbX && lcbX < paddleX * 3 / 4)
        j += 1;
    else if (lcbX > paddleX * 1 / 4)
        j -= 1;
    if (x > rcbX && rcbX < paddleX * 3 / 4)
        j += 1;
    else if (rcbX > paddleX * 1 / 4)
        j -= 1;
}

function drawAwayMidfielders() {

    //midfielders
    ctx.beginPath();
    var lwbX = paddleX * 1 / 8 + j;
    var lwbY = canvas.height * 3 / 8 - paddleHeight;
    ctx.rect(0, lwbY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(awayPlayer, lwbX, lwbY - 15, playerWidth, playerHeight);
    box = new B(new V(lwbX, lwbY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var lcmX = paddleX * 3 / 8 + j;
    var lcmY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(awayPlayer, lcmX, lcmY - 15, playerWidth, playerHeight);
    box = new B(new V(lcmX, lcmY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var rcmX = paddleX * 5 / 8 + j;
    var rcmY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(awayPlayer, rcmX, rcmY - 15, playerWidth, playerHeight);
    box = new B(new V(rcmX, rcmY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var rwbX = paddleX * 7 / 8 + j;
    var rwbY = canvas.height * 3 / 8 - paddleHeight;
    ctx.drawImage(awayPlayer, rwbX, rwbY - 15, playerWidth, playerHeight);
    box = new B(new V(rwbX, rwbY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    if (x > lwbX && lwbX < paddleX * 3 / 4)
        j += 1;
    else if (lwbX > paddleX * 1 / 4)
        j -= 1;
    if (x > rwbX && rwbX < paddleX * 3 / 4)
        j += 1;
    else if (rwbX > paddleX * 1 / 4)
        j -= 1;
    if (x > rcmX && rcmX < paddleX * 3 / 4)
        j += 1;
    else if (rcmX > paddleX * 1 / 4)
        j -= 1;
    if (x > lcmX && lcmX < paddleX * 3 / 4)
        j += 1;
    else if (lcmX > paddleX * 1 / 4)
        j -= 1;
}


function drawAwayStrikers() {
    //attackers
    ctx.beginPath();
    var lwX = paddleX / 4 + j;
    var lwY = canvas.height * 23 / 32 - paddleHeight;
    ctx.rect(0, lwY + 2, canvas.width, paddleHeight - 5);
    ctx.fillStyle = "#BDBDBD";
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.closePath();
    ctx.drawImage(awayPlayer, lwX, lwY - 15, playerWidth, playerHeight);
    box = new B(new V(lwX, lwY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var cfX = paddleX / 2 + j;
    var cfY = canvas.height * 23 / 32 - paddleHeight;
    ctx.drawImage(awayPlayer, cfX, cfY - 15, playerWidth, playerHeight);
    box = new B(new V(cfX, cfY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);

    ctx.beginPath();
    var rwX = paddleX * 3 / 4 + j;
    var rwY = canvas.height * 23 / 32 - paddleHeight;
    ctx.drawImage(awayPlayer, rwX, rwY - 15, playerWidth, playerHeight);
    box = new B(new V(rwX, rwY), playerWidth, paddleHeight).toPolygon();
    collisionDetectionAway(box);


    // if(y + 10 == rwY || y - 10 == rwY) {
    if (x > lwX && lwX < paddleX * 3 / 4)
        j += 1;
    else if (lwX > paddleX * 1 / 4)
        j -= 1;
    if (x > rwX && rwX < paddleX * 3 / 4)
        j += 1;
    else if (rwX > paddleX * 1 / 4)
        j -= 1;
    if (x > cfX && cfX < paddleX * 3 / 4)
        j += 1;
    else if (cfX > paddleX * 1 / 4)
        j -= 1;
    //}


}

function keyDownHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = true;
    } else if (e.keyCode == 37) {
        leftPressed = true;
    } else if (e.keyCode == 65) {
        leftPressedAway = true;
    } else if (e.keyCode == 68) {
        rightPressedAway = true;
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39) {
        rightPressed = false;
    } else if (e.keyCode == 37) {
        leftPressed = false;
    } else if (e.keyCode == 65) {
        leftPressedAway = false;
    } else if (e.keyCode == 68) {
        rightPressedAway = false;
    }
}