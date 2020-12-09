
let socket = io();
let server ;

let action_text ;
let action_first_name;
let action_command;
let action_second_name;
let action_canvas ;
let canvas;

let images = {};
let isAnimationRunning = false;
let commandQueue = new Array();
// TODO config
let delay = 500;

socket.on("connection", function(server_socket){

    server = server_socket;

});

socket.on("pat", function(data){

    if(!isAnimationRunning){
        startPat(data);
    }else{
        commandQueue.push({
            type : "pat",
            data : data
        });
    }

});

socket.on("slap", function(data){

    if(!isAnimationRunning){
        startSlap(data);
    }else{
        commandQueue.push({
            type : "slap",
            data : data
        });
    }

});

socket.on("wide", function(data){

    if(!isAnimationRunning){
        startWide(data);
    }else{
        commandQueue.push({
            type : "wide",
            data : data
        });
    }

});

$(document).ready(function(){

    action_text = $("#action-text");
    action_first_name = $("#first-name");
    action_command = $("#command");
    action_second_name = $("#second-name");
    action_canvas = $("#action-canvas").get(0);
    action_canvas.width = 400;
    action_canvas.height = 400;
    canvas = action_canvas.getContext("2d");

    addImage("kass-1");
    addImage("kass-2");
    addImage("sidon-1");
    addImage("hand-1");
    addImage("hand-2");
    addImage("hand-3");
    addImage("hand-4");
    addImage("hand-5");
    addImage("hand-6");
    addImage("hand-7");
    addImage("hand-8");
    addImage("handslap-1");
    addImage("handslap-2");
    addImage("handwin-1");
    addImage("handwin-2");
    addImage("handwin-3");
    addImage("redstar");
    addImage("handlose-1");
    addImage("handlose-2");
    addImage("handlosegold-1");
    addImage("handlosegold-2");
    addImage("luigi");
    addImage("luigi-slapped");
    addImage("luigiwin");
    addImage("luigiwinhand");
    addImage("sunglasses");
    addImage("wide");

});

function showText(first, command, second){

    action_first_name.css("color", first.color);
    action_first_name.text(first.name);
    action_command.text(command);
    if(second){
        action_second_name.css("color", second.color);
        action_second_name.text(second.name);
    }

}

function hideText(){

    action_first_name.removeClass();
    action_second_name.removeClass();
    action_first_name.text("");
    action_command.text("");
    action_second_name.text("");
    action_text.removeClass();

}

// TODO ADD Execution Easter Egg for Askanri and everyone
function startPat(data){

    isAnimationRunning = true;
    showText(data.user, "pats", data.patted);
    let sidonX = -490, sidonY = -470;
    let sidonDestinationX = -90;
    canvas.drawImage(images["kass-1"], 100, 100, 300, 300);

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        sidonX += 10;
        sidonY += 10;
        canvas.drawImage(images["kass-1"], 100, 100, 300, 300);
        canvas.drawImage(images["sidon-1"], sidonX, sidonY, 450, 450); // x = 40; y = 70
        
        if(sidonX === sidonDestinationX){
            clearInterval(drawTimer);
            patting(sidonX, sidonY);
        }
    }, 50);

}

function patting(sidonX, sidonY){

    let sidonAngle = 0;
    let sidonMaxAngle = -10;
    let angleInc = 0.7;
    let isMotionUp = true;
    let hitMaxAngle = 0;
    let blushX = 325, blushY = 275;
    let isAnimationFinished = false;

    let blushGradient = canvas.createRadialGradient(blushX, blushY, 1, blushX, blushY, 40);
    blushGradient.addColorStop(0.3, "rgba(255, 192, 203, 1)");
    blushGradient.addColorStop(0.8, "rgba(255, 192, 203, 0.4)");
    blushGradient.addColorStop(1, "rgba(255, 192, 203, 0)");

    drawTimer = setInterval(function(){
        canvas.setTransform(1, 0, 0, 1, 0, 0);
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        canvas.drawImage(images["kass-2"], 100, 100, 300, 300);
        canvas.fillStyle = blushGradient;
        canvas.beginPath();
        canvas.arc(blushX, blushY, 40, 0, Math.PI * 2);
        canvas.fill();
        canvas.closePath();

        if(isMotionUp){
            sidonAngle -= angleInc;
            if(sidonAngle <= sidonMaxAngle){
                isMotionUp = false;
                hitMaxAngle ++;
            }
        }else{
            sidonAngle += angleInc;
            if(sidonAngle >= 0){
                isMotionUp = true;
                if(hitMaxAngle === 5){
                    isAnimationFinished = true;
                }
            }
        }
        canvas.rotate(sidonAngle * Math.PI / 180);
        canvas.drawImage(images["sidon-1"], sidonX, sidonY, 450, 450);

        if(isAnimationFinished){
            endAnimation(drawTimer);
        }
    }, 50);

}

function startSlap(data){

    isAnimationRunning = true;
    showText(data.user, "slaps", data.slapped);
    let handWidth = 64 * 3, handHeight = 49 * 3;
    let handX = canvas.canvas.width - handWidth, handY = 200 + 20 - (handHeight / 2);
    let handSprite = 1;
    let cycles = 0;
    let luigiWidth = 90 * 2, luigiHeight = 143 * 2;
    let luigiX = 0, luigiY = canvas.canvas.height - luigiHeight;

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        canvas.drawImage(images["luigi"], luigiX, luigiY, luigiWidth, luigiHeight);
        canvas.drawImage(images["hand-" + handSprite], handX, handY, handWidth, handHeight);
        if(cycles === 2){
            clearInterval(drawTimer);
            let luigi = { x : luigiX, y : luigiY, width : luigiWidth, height : luigiHeight};
            let hand = { x : handX, y : handY, width : handWidth, height : handHeight};
            setTimeout(function(){
                if(data.outcome.value){
                    action_first_name.attr("data-exp", "+" + data.outcome.exp + "xp");
                    approachForSlap(luigi, hand);
                }else{
                    action_second_name.attr("data-exp", "+" + data.outcome.exp + "xp");
                    missing(luigi, hand);
                }  
            }, delay);          
        }
        if(handSprite === 8){
            handSprite = 1;
        }else{
            handSprite++;
        }
        if(handSprite === 1){
            cycles++
        }
        
    }, 100);

}

function approachForSlap(luigi, hand){

    let drawTimer = setInterval(function() {
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        if(hand.x > (luigi.width / 2) - 20){
            hand.x -= 10;
        }else{
            clearInterval(drawTimer);
            slapping(luigi, hand);
        }
        canvas.drawImage(images["hand-1"], hand.x, hand.y, hand.width, hand.height);
        canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);
    }, 50);

}

function slapping(luigi, hand){

    let counter = 0;
    let luigiAngle = 0;
    let translationX = luigi.width /2 , translationY = canvas.canvas.height; 

    let drawTimer = setInterval(function() {
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        if(counter === 0){
            canvas.drawImage(images["handslap-1"], hand.x, hand.y, hand.width, hand.height);
            canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);
            counter++;
        }else if(counter === 1){
            canvas.drawImage(images["handslap-2"], hand.x, hand.y, hand.width, hand.height);
            canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);
            counter++;
        }else if(counter === 2){
            canvas.drawImage(images["handslap-1"], hand.x, hand.y, hand.width, hand.height);
            canvas.drawImage(images["luigi-slapped"], luigi.x, luigi.y, luigi.width, luigi.height);
            counter++;
        }else if(counter === 3){
            canvas.drawImage(images["handslap-1"], hand.x, hand.y, hand.width, hand.height);
            clearInterval(drawTimer);
            action_first_name.addClass("winner");
            drawTimer = setInterval(function(){
                canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
                canvas.drawImage(images["handslap-1"], hand.x, hand.y, hand.width, hand.height);
                luigiAngle -= 5;
                canvas.save();
                canvas.translate(translationX, translationY);
                canvas.rotate(luigiAngle * Math.PI / 180);
                canvas.drawImage(images["luigi-slapped"], luigi.x - translationX, luigi.y - translationY, luigi.width, luigi.height);
                canvas.restore();

                if(luigiAngle <= -90){
                    clearInterval(drawTimer);
                    luigi.angle = luigiAngle;
                    luigi.transX = translationX;
                    luigi.transY = translationY;
                    handWins(luigi, hand);
                }
            }, 50);
        }
    }, 250);
}

function handWins(luigi, hand){

    let counter = 0;
    let handTipX = hand.x + 35, handTipY = hand.y + 5;
    let starWidth = 300 * 0.8, starHeight = 300 * 0.8;
    let starAngle = 0;

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        canvas.save();
        canvas.translate(luigi.transX, luigi.transY);
        canvas.rotate(luigi.angle * Math.PI / 180);
        canvas.drawImage(images["luigi-slapped"], luigi.x - luigi.transX, luigi.y - luigi.transY, luigi.width, luigi.height);
        canvas.restore();

        if(counter === 0){
            canvas.drawImage(images["handslap-1"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 1){
            canvas.drawImage(images["handwin-1"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 2){
            canvas.drawImage(images["handwin-2"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 3){
            clearInterval(drawTimer);
            drawTimer = setInterval(function(){
                canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

                canvas.save();
                canvas.translate(luigi.transX, luigi.transY);
                canvas.rotate(luigi.angle * Math.PI / 180);
                canvas.drawImage(images["luigi-slapped"], luigi.x - luigi.transX, luigi.y - luigi.transY, luigi.width, luigi.height);
                canvas.restore();

                canvas.drawImage(images["handwin-3"], hand.x, hand.y, hand.width, hand.height);
                canvas.save();
                canvas.translate(handTipX, handTipY);
                canvas.rotate(starAngle * Math.PI / 180);
                canvas.drawImage(images["redstar"], -(starWidth/2), -(starHeight/2), starWidth, starHeight);
                canvas.restore();
                starAngle += 10;
                if(starAngle  >= 225){
                    setTimeout(function(){
                        endAnimation(drawTimer);
                    }, delay);
                }
            }, 50);
        }

    }, 150);

}

function missing(luigi, hand){

    let opacity = 100;
    let shouldLuigiReappear = false;
    let drawTimer = setInterval(function() {
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        canvas.filter = "opacity(" + opacity + "%)";
        canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);
        canvas.filter = "none";
        if(shouldLuigiReappear){
            opacity = opacity < 100 ? opacity + 10 : 100;
        }else{
            opacity = opacity > 0 ? opacity - 10 : 0;
        }

        hand.x -= 10;
        canvas.drawImage(images["hand-1"], hand.x, hand.y, hand.width, hand.height);

        if(!shouldLuigiReappear && hand.x < (0 - hand.width)){
            shouldLuigiReappear = true;
        }else if(shouldLuigiReappear && opacity === 100){
            hand.x = canvas.canvas.width;
            clearInterval(drawTimer);
            handReappears(luigi, hand);
        }
    }, 50);

}

function handReappears(luigi, hand){

    let handDestinationX = canvas.canvas.width - hand.width;

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        hand.x -= 10;
        canvas.drawImage(images["hand-1"], hand.x, hand.y, hand.width, hand.height);

        canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);

        if(hand.x <= handDestinationX){
            clearInterval(drawTimer);
            handLoses(luigi, hand);
        }
    }, 50);

}

function handLoses(luigi, hand){

    let counter = 0;
    let opacity = 100, opacityInc = 20;

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        canvas.filter = "opacity(" + opacity + "%)";
        if(counter === 0){
            canvas.drawImage(images["handlose-1"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 1){
            canvas.drawImage(images["handlosegold-1"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 2){
            canvas.drawImage(images["handlose-2"], hand.x, hand.y, hand.width, hand.height);
            counter++;
        }else if(counter === 3){
            canvas.drawImage(images["handlosegold-2"], hand.x, hand.y, hand.width, hand.height);
            counter = 0;
            if(opacity < opacityInc){
                opacity = 0;
            }else{
                opacity -= opacityInc;
            }
        }
        canvas.filter = "none";

        canvas.drawImage(images["luigi"], luigi.x, luigi.y, luigi.width, luigi.height);

        if(opacity === 0){
            clearInterval(drawTimer);
            luigiWins(luigi);
        }

    }, 100);

}

function luigiWins(luigi){
    
    let luigiArmWidth = 43 * 3, luigiArmHeight = 35 * 3;
    let luigiArmX = (luigi.width / 2) + 50, luigiArmY = canvas.canvas.height - luigiArmHeight - 10;
    let luigiArmAngle = 60;

    let sunglassesWidth = 100, sunglassesHeight = 35;
    let sunglassesX = 45, sunglassesY = -sunglassesHeight;
    let sunglassesYInc = 20, sunglassesDestinationY = 240;
    let sunglassesAngle = -40;

    action_second_name.addClass("winner");
    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        canvas.save();
        canvas.translate(luigiArmX, luigiArmY + (luigiArmHeight / 2));
        canvas.rotate(luigiArmAngle * Math.PI / 180);
        canvas.drawImage(images["luigiwinhand"], 0, -(luigiArmHeight / 2), luigiArmWidth, luigiArmHeight);
        canvas.restore();

        canvas.drawImage(images["luigiwin"], luigi.x, luigi.y, luigi.width, luigi.height);

        if(sunglassesDestinationY - sunglassesY < sunglassesYInc){
            sunglassesY = sunglassesDestinationY;
        }else if(sunglassesDestinationY - sunglassesY > sunglassesYInc){
            sunglassesY += sunglassesYInc;
        }
        canvas.save();
        canvas.translate(sunglassesX, sunglassesY + (sunglassesHeight / 2));
        canvas.rotate(sunglassesAngle * Math.PI / 180);
        canvas.drawImage(images["sunglasses"], 0, -(sunglassesHeight / 2), sunglassesWidth, sunglassesHeight);
        canvas.restore();

        if(luigiArmAngle === -20){
            setTimeout(function(){
                endAnimation(drawTimer);            
            }, 1500);
        }else{
            luigiArmAngle -= 5;
        }
    }, 50);

}

function startWide(data){

    isAnimationRunning = true;
    showText(data.user, " is a wider");
    canvas.canvas.width = 800;
    let wideWidth = 112 * 2, wideHeight = 79 * 2;
    let wideX = (canvas.canvas.width / 2) - (wideWidth / 2),
         wideY = (canvas.canvas.height / 2) - (wideHeight / 2);
    let delayCounter = 0;

    let drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);

        if(delayCounter < 20){
            delayCounter++;
        }else{
            wideWidth += 10;
            wideX = (canvas.canvas.width / 2) - (wideWidth / 2);
            wideY = (canvas.canvas.height / 2) - (wideHeight / 2);
        }
        canvas.drawImage(images["wide"], wideX, wideY, wideWidth, wideHeight);

        if(wideWidth >= 800){
            
            endAnimation(drawTimer);
        }
    }, 50);

}

function endAnimation(drawTimer){

    clearInterval(drawTimer);
    let opacity = 100;
    let image = new Image();
    image.src = action_canvas.toDataURL();
    action_text.addClass("fade");
    drawTimer = setInterval(function(){
        canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
        opacity -= 10;
        let filter = "opacity("+ opacity +"%)";
        canvas.filter = filter;
        canvas.drawImage(image, 0, 0);
        if(opacity <= 0){
            clearInterval(drawTimer);
            setTimeout( function(){
                hideText();
                canvas.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
                canvas.filter = "none";
                canvas.setTransform(1, 0, 0, 1, 0, 0);
                canvas.canvas.width = 400;
                isAnimationRunning = false;
                checkQueue();
            }, 100);
        }
    }, 50);

}

function checkQueue(){

    if(commandQueue.length < 1) return;

    let nextCommand = commandQueue.splice(0, 1)[0];
    switch(nextCommand.type){
        case "pat": startPat(nextCommand.data); break;
        case "slap": startSlap(nextCommand.data); break;
        case "wide": startWide(nextCommand.data); break;
    }

}

function addImage(id){

    images[id] =  $("#" + id).get(0);

}
