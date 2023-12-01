var PLAY = 1;
var END = 0;
var gameState = 1;
var scoreMax = 0;
var activeIAStatus = false;

var trex ,trex_running, trex_collide;
var ground, groundImage;
var invisibleGround;

var cloud, cloudImage;
var obstacles, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6; 

var score;

var gameOver, gameOverImg, restart, restartImg;

var soundJump , soundCheckPoint, soundDie;

var iaActiveButton;



function preload(){
  trex_running = loadAnimation("./src/images/trex1.png", "./src/images/trex3.png", "./src/images/trex4.png");
  trex_collided = loadImage("./src/images/trex_collided.png");

  groundImage = loadImage("./src/images/ground2.png");

  cloudImage = loadImage("./src/images/cloud.png");

  obstacle1 = loadImage("./src/images/obstacle1.png");
  obstacle2 = loadImage("./src/images/obstacle2.png");
  obstacle3 = loadImage("./src/images/obstacle3.png");
  obstacle4 = loadImage("./src/images/obstacle4.png");
  obstacle5 = loadImage("./src/images/obstacle5.png");
  obstacle6 = loadImage("./src/images/obstacle6.png");

  restartImg = loadImage("./src/images/restart.png");
  gameOverImg = loadImage("./src/images/gameOver.png");

  soundJump = loadSound("./src/audios/jump.mp3");
  soundDie = loadSound("./src/audios/die.mp3");
  soundCheckPoint = loadSound("./src/audios/checkPoint.mp3");
}

function setup(){
  createCanvas(windowWidth, windowHeight)
  
  trex = createSprite(50,windowHeight/5,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;
  trex.x=50;

  ground = createSprite(200,windowHeight/5,400,20);
  ground.addImage("ground", groundImage);
  ground.x = ground.width /2;

  invisibleGround = createSprite(200,windowHeight/5,400,10);
  invisibleGround.visible = false;

  gameOver = createSprite(300,100);
  gameOver.addImage(gameOverImg);
  gameOver.scale = 0.5;
  
  restart = createSprite(300,140);
  restart.addImage(restartImg);  
  restart.scale = 0.5;

  // Criando grupos de obstáculos e nuvens
  obstaclesGroup = new Group();
  cloudGroup = new Group();
  
  //trex.setCollider("circle", 10, 0, 50);
  trex.setCollider("rectangle", 0, 0, 200, trex.height);
  //trex.debug = true; 

  edges = createEdgeSprites();

  score = 0;

  iaActiveButton = createSprite(80,25, 20, 15);
  
}

function draw(){

  

  background(180);
  text("Pontuação: " + score, 500, 50);  
  text("Recorde: " + scoreMax, 500, 70);

  text("Ativar IA", 20, 30);


  if (gameState === PLAY) {
    trex.changeAnimation("running", trex_running);
    // esconder os sprites de fim de jogo
    gameOver.visible = false;
    restart.visible = false;

    // pontuação
    // score = score + Math.round(frameCount/60);
    score = score + Math.round(getFrameRate()/60);
    
    // adicionar som de pontuação (aula16)
    if(score > 0 && score % 100 === 0){
      soundCheckPoint.play(); 
    }

    // mover o chão e chão infinito
    ground.velocityX = -(2 + 3*score/100); //aula16
   
    if(ground.velocityX < -10){
      ground.velocityX = -10;
    }
    if (ground.x < 0) {
      ground.x = ground.width/2;
    }
    
    
    // movimentação do TRex
    if((touches.length > 0 || keyDown("space")) && (trex.y >=  150)){
      trex.velocityY = -10;
      soundJump.play(); //aula16  
      touches = []
    }
  
    //acrescentar gravidade
    trex.velocityY = trex.velocityY + 0.5;

    // gerar os obstáculos
    spawnClouds();
    spawnObstacles();

    //condição de fim de jogo - original
    // if(obstaclesGroup.isTouching(trex)){        
    //     trex.velocityY = -12
    //     soundJump.play(); //aula 16
       
    //     //gameState = END;     
    //    // soundDie.play();  //aula16
    //    if(scoreMax < score){
    //      scoreMax = score;  
    //    }        
    // }

    //condição de fim de jogo - nova versão      
      if(activeIAStatus === true && obstaclesGroup.isTouching(trex)) {
        trex.velocityY = -7
        soundJump.play(); //aula 16
      } 
      if(activeIAStatus === false && obstaclesGroup.isTouching(trex)) {
        gameState = END;     
        soundDie.play();  //aula16
       if(scoreMax < score){
         scoreMax = score;  
       }
      }  
    

    if(mousePressedOver(iaActiveButton)){
      activeIA(activeIAStatus);
    }

  } else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true; 
    if(mousePressedOver(restart)){
      reset();
    }
    
    //mudar a animação do TRex e impor a gravidade
    trex.changeAnimation("collided", trex_collided);
    trex.velocityY = 0;

    // Parar a movimentação dos obstáculos e chão
    obstaclesGroup.setVelocityXEach(0);
    cloudGroup.setVelocityXEach(0);
    ground.velocityX = 0;

    // Definir tempo de vida dos objetos do jogo para que eles nunca sejam destruídos
    obstaclesGroup.setLifetimeEach(-1);
    cloudGroup.setLifetimeEach(-1);
  }
  
  //impedir que trex ultrapasse a parte inferior  
  trex.collide(invisibleGround);
    
  drawSprites();

  
  let display = touches.length + ' touches';
  text(display, 200, 10);
}

function spawnClouds() {
  if (frameCount % 60 === 0) {
    // Gerar nuvens aleatórias
    cloud = createSprite(600, 100, 40, 10);
    cloud.addImage(cloudImage);
    cloud.y = Math.round(random(10,60)); 
    cloud.scale = 0.4;
    cloud.velocityX = -(3 + score / 100); //aula15   

    if (cloud.velocityX < -10) {
      cloud.velocityX =-10;     
    }
    
    // Atribuir tempo de vida à variável (width/velocity)
    cloud.lifetime = 200; 

    // Ajuste de profundidade
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
   
    cloudGroup.add(cloud);
  }
}

function spawnObstacles() {
  if (frameCount % 60 === 0) {
    obstacles = createSprite(400, windowHeight/5.3, 10, 40);  
    obstacles.velocityX = -(6 + score / 100); //aula15      
    
    if (obstacles.velocityX < -15) {
      obstacles.velocityX = -15;       
    }
    obstacles.scale = 0.5;

    console.log(obstacles.velocityX)
    // Gerar obstáculos aleatórios
    var rand = Math.round(random(1,6));
    switch (rand) {
      case 1:
        obstacles.addImage(obstacle1);
        break;
        
      case 2:
        obstacles.addImage(obstacle2);
        break;

      case 3:
        obstacles.addImage(obstacle3);
        break;  
        
      case 4:
        obstacles.addImage(obstacle4);
        break;    

      case 5:
        obstacles.addImage(obstacle5);
        break;  
          
      case 6:
        obstacles.addImage(obstacle6);
        break;  

      default:
        break;
    }

    // Atribuir tempo de vida à variável (width/velocity)
    obstacles.lifetime = 300; 

    obstacles.depth = trex.depth;

    obstaclesGroup.add(obstacles);
  }
}

function reset() {
  gameState = PLAY; 
  score = 0;
  //trex.x=50;
  obstaclesGroup.destroyEach();
  cloudGroup.destroyEach(); 
}

function activeIA(currentStatus) {
  if(currentStatus === true){
    activeIAStatus = false;
    iaActiveButton.tint = "gray";
    trex.debug = false;
  } else {
    activeIAStatus = true;
    iaActiveButton.tint = "green";
    trex.debug = true;
  }
}