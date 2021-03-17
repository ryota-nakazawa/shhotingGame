const DEBUG = false;

let drawCount=0;
let fps =0;
let lastTime=Date.now();

//スムージング
const SMOOTHING = false;

const GAME_SPEED = 1000/60;

//画面サイズ
const SCREEN_W =320;
const SCREEN_H =320;

const canvas_W = SCREEN_W*2;
const canvas_H = SCREEN_H*2;

const FIELD_W = SCREEN_W + 120;
const FIELD_H = SCREEN_H + 40;

const STAR_MAX =300;

//キャンバス
let can = document.getElementById("can");
let con = can.getContext("2d");
can.width = canvas_W;
can.height = canvas_H;

con.mozimageSmoothingEnagbled = SMOOTHING;
con.webkitimageSmoothingEnabled = SMOOTHING;
con.msimageSmoothingEnabled = SMOOTHING;
con.imageSmoothingEnabled = SMOOTHING;

//仮想画面
let vcan = document.createElement("canvas");
let vcon = vcan.getContext("2d");
vcan.width = FIELD_W;
vcan.height = FIELD_H;

let camera_x =0;
let camera_y =0;

//ボスのHP
let bossHP = 0;
let bossMHP = 0;



let gameOver = false;
let score = 0;

let star=[];

//キーボードの状態
let key = [];

//オブジェクト
let teki = [];
let tekitama = [];
let tama=[];
let expo=[];
let jiki = new Jiki();



//teki[0]= new Teki(75,200<<8,200<<8,0,0);

//画像の読み込み
let spriteImage = new Image();
spriteImage.src = "sprite.png";




//初期化
function gameInit()
{
for(let i = 0; i<STAR_MAX; i++)star[i] = new Star();
setInterval( gameLoop, GAME_SPEED);
}

function updateObj(obj)
{
    for(let i = obj.length-1; i>=0; i--)
    {
        obj[i].update();
        if(obj[i].kill)obj.splice(i,1);
    }
}

function drawObj(obj)
{
    for(let i = 0; i<obj.length; i++)obj[i].draw();
}

//移動の処理
function updateAll()
{
    for(let i = 0; i<STAR_MAX; i++)star[i].updata();
    updateObj(tama);
    updateObj(teki);
    updateObj(tekitama);
    updateObj(expo);
    if(!gameOver)jiki.update();
}

function drawAll()
{
    vcon.fillStyle=(jiki.damege)?"red":"black";
    vcon.fillRect(camera_x,camera_y,SCREEN_W,SCREEN_H);
    for(let i = 0; i<STAR_MAX; i++)star[i].draw();
    drawObj(tama);
    if(!gameOver)jiki.draw();
    drawObj(tekitama);
    drawObj(teki);
    drawObj(expo);

    //自機の範囲 0 ~ FIELD_W
    //カメラの範囲 0 ~ (FIELD_W - SCREEN_W)
    camera_x = Math.floor((jiki.x>>8)/FIELD_W * (FIELD_W - SCREEN_W)); //自機の座標を相対座標として表示
    camera_y = Math.floor((jiki.y>>8)/FIELD_H * (FIELD_H - SCREEN_H)); //自機の座標内でここならカメラの範囲ではどこにあたる的な
    //今回のパターンでは常にx,y座標が実際の半分の位置関係を保ったままスクリーンが移動する//

    //ボスのHPを表示
    if(bossHP>0)
    {
        let sz = (SCREEN_W-20)*bossHP/bossMHP;
        let sz2 = SCREEN_W-20;
        //fillは中身の色、strokeは枠の色
        vcon.fillStyle="rgba(255,0,0,0.5)";
        vcon.fillRect(camera_x+10,camera_y+10,sz,10);
        vcon.strokeStyle="rgba(255,0,0,0.9)";
        vcon.strokeRect(camera_x+10,camera_y+10,sz2,10);

    }

    if(jiki.hp>0)
    {
        let sz = (SCREEN_W-20)*jiki.hp/jiki.mhp;
        let sz2 = SCREEN_W-20;
        //fillは中身の色、strokeは枠の色
        vcon.fillStyle="rgba(0,0,255,0.5)";
        vcon.fillRect(camera_x+10,camera_y+SCREEN_H-14,sz,10);
        vcon.strokeStyle="rgba(0,0,255,0.9)";
        vcon.strokeRect(camera_x+10,camera_y+SCREEN_H-14,sz2,10);

    }

    vcon.font="20px 'Impact'";
    vcon.fillStyle="white";
    vcon.fillText("SCORE:"+score,camera_x+10,camera_y+20);
    //仮想画面から実際のキャンバスにコピー

    con.drawImage( vcan, camera_x,camera_y,SCREEN_W,SCREEN_H,
        0,0,canvas_W, canvas_H);
}

function putInfo()
{
    con.font="20px 'Impact'";
    con.fillStyle="white";
    if(gameOver)
    {
        let s = "GAME OVER";
        let w = con.measureText(s).width;
        let x = canvas_W/2 - w/2;
        let y = canvas_H/2 - 20;
        con.fillText(s,x,y);
        s = "Push 'R' key to restart!!";
        w = con.measureText(s).width;
        x = canvas_W/2 - w/2;
        y = canvas_H/2 - 40;
        con.fillText(s,x,y);

    }
    if(DEBUG)
    {
        drawCount++;
        if(lastTime + 1000 <= Date.now())
        {
            fps = drawCount;
            drawCount =0;
            lastTime = Date.now();
        }
        
        con.fillText("FPS:" + fps,20,20);
        con.fillText("Tama:" + tama.length,20,40);
        con.fillText("Teki:" + teki.length,20,60);
        con.fillText("TekiTama:" + tekitama.length,20,80);
        con.fillText("Explosion:" + expo.length,20,100);
        con.fillText("X:" + (jiki.x>>8),20,120);
        con.fillText("Y:" + (jiki.y>>8),20,140);
        con.fillText("HP:" + jiki.hp,20,160);
        con.fillText("SCORE:" + score,20,180);
    }
}

let gameCount =0;
let gameWave =0;
let gameRound =0;

function gameLoop()
{
    gameCount++;
    //テスト敵
    if(gameWave ==0)
    {
        if(rand(0,15)==1 )
        {
            teki.push(new Teki(0,rand(0,FIELD_W)<<8,0,0,rand(300,700)));
        }
        if(gameCount >= 60*10)
        {
            gameWave = 1;
            gameCount = 0;
        }
    }
    else if(gameWave ==1)
    {
        if(rand(0,15)==1 )
        {
            teki.push(new Teki(1,rand(0,FIELD_W)<<8,0,0,rand(300,700)));
        }
        if(gameCount >= 60*10)
        {
            gameWave = 2;
            gameCount = 0;
        }
    }
    if(gameWave ==2)
    {
        if(rand(0,15)==1 )
        {
            let r = rand(0,1);
            teki.push(new Teki(r,rand(0,FIELD_W)<<8,0,0,rand(300,700)));
        }
        if(gameCount >= 60*10)
        {
            gameWave = 3;
            gameCount = 0;
            teki.push(new Teki(2,FIELD_W/2<<8,-70,0,200));
        }
    }
    if(gameWave ==3)
    {
        if(teki.length == 0 )
        {
            gameWave = 0;
            gameCount =0;
            gameRound++;
        }
    }
    
        
    updateAll();
    drawAll();
    putInfo();
}

window.onload=function()
{
    //alert("ページが読み込まれました！");
    gameInit();
    //teki.push(new Teki(2,FIELD_W/2<<8,0,0,200));
}

