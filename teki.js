
//teki.js 敵関連

//敵弾クラス
class tekiTama extends CharaBase
{
    constructor(sn,x,y,vx,vy,t)
    {
        super(sn,x,y,vx,vy);
        this.r = 4;
        this.timer = t;
        if(t==undefined)this.timer = 0;
        else this.timer = t;
    }
    update()
    {
        if(this.timer)
        {
            this.timer--;
            return;
        }
        super.update();

        lifePoint(this);

        this.sn = 14 + ((this.count>>3)&1);
    }
}

//敵クラス
class Teki extends CharaBase
{
    constructor(t,x,y,vx,vy)
    {
        super(0,x,y,vx,vy);
        this.flag = false;
        //this.w = 20;
        //this.h = 20;
        this.tnum = tekiMaster[t].tnum;
        this.r = tekiMaster[t].r;
        this.mhp = tekiMaster[t].hp;
        this.hp = this.mhp;
        this.score = tekiMaster[t].score;
        /*
        this.tnum = tnum;
        this.r = 10;
        */
        this.count = 0;
        this.dr = 90;
        this.relo = 0;
    }

    update()
    {
        super.update();
        this.count++;
        this.relo++;
        tekiFunc[this.tnum](this);
        
        //lifePoint(this);
        if(!gameOver && !jiki.muteki && checkHit(this.x,this.y,this.r,jiki.x,jiki.y,jiki.r))   
        {
            if((this.hp -= 30) <= 0)
            {
                this.kill = true;
                explosion(this.x,this.y,this.vx>>3,this.vy>>3);
                score += this.score;
            } 
                
            if((jiki.hp -= 30) <=0)
            {
                gameOver = true;
            }else
            {
                jiki.damege = 10;
                jiki.muteki = 60; 
            }
                       
        }
        
    }

    draw()
    {
        super.draw();
    }
}

//ピンクのひよこの移動パターン
function tekiMove01(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx<120)obj.vx+=4;
            else if(jiki.x < obj.x && obj.vx>-120)obj.vx-=4;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx<400)obj.vx+=30;
            else if(jiki.x > obj.x && obj.vx>-400)obj.vx-=30;
        }
        
        tekiShot(obj,600);

        if(obj.flag && obj.vy>-800)obj.vy-=30;

        //スプライトの変更
        const ptn = [39,40,39,41];
        obj.sn = ptn[(obj.count>>3)%4];

}

//黄色のひよこの移動パターン
function tekiMove02(obj)
{
    if(!obj.flag)
        {
            if(jiki.x > obj.x && obj.vx<120)obj.vx+=4;
            else if(jiki.x < obj.x && obj.vx>-120)obj.vx-=4;
        }
        else
        {
            if(jiki.x < obj.x && obj.vx<200)obj.vx+=30;
            else if(jiki.x > obj.x && obj.vx>-200)obj.vx-=30;
        }
        
        tekiShot(obj,200);

        //スプライトの変更
        const ptn = [33,34,33,35];
        obj.sn = ptn[(obj.count>>3)%4];
}

function tekiMove03(obj)
{
    if(!obj.flag && (obj.y>>8)>=60)obj.flag=1;
    if(obj.flag == 1)
    {
        obj.vy -=2;
        if( obj.vy <=0)
        {
            obj.flag = 2;
            obj.vy =0;
        }
    }else if(obj.flag == 2)
    {
        if(obj.vx < 300)obj.vx += 30;
        if((obj.x>>8) > FIELD_W-120)obj.flag = 3;
    }else if(obj.flag == 3)
    {
        if(obj.vx > -300)obj.vx -= 30;
        if((obj.x>>8) < 120)obj.flag = 2;
    }

    //ボスの玉発射
    if(obj.flag > 1)
    {
        let angle,dx,dy;
        angle = obj.dr * Math.PI/180;      
        dx = Math.cos(angle)*300;
        dy = Math.sin(angle)*300;
        let x2 = (Math.cos(angle)*65)<<8;
        let y2 = (Math.sin(angle)*65)<<8;
        tekitama.push(new tekiTama(15,obj.x+x2,obj.y+y2,dx,dy,60));
        if((obj.dr += 12) >= 360)obj.dr = 0;
    }

    if(obj.hp < obj.mhp/2 && obj.count%180 ==0)
    {
        let angle = 0;
        let dx,dy;
        for(let i =0; i < 4; i++)
        {
            angle += 36;
            angle1 = angle * Math.PI/180;   
            dx = Math.cos(angle1)*200;
            dy = Math.sin(angle1)*200;
            let x2 = (Math.cos(angle1)*65)<<8;
            let y2 = (Math.sin(angle1)*65)<<8;
            teki.push(new Teki(3,obj.x+x2,obj.y+y2,dx,dy));
        }
        
    }
    
    obj.sn=75;
}
//ボスの子分
function tekiMove04(obj)
{
    if(obj.count > 60)
    {
        if(jiki.x > obj.x && obj.vx<200)obj.vx+=40;
        else if(jiki.x < obj.x && obj.vx>-200)obj.vx-=40;
    }

    if(obj.count > 120 && obj.relo%60 ==0)
    {
        let angle,dx,dy;
        angle = Math.atan2(jiki.y - obj.y, jiki.x-obj.x);
                
        angle += rand(-10,10)*Math.PI/180;
        dx = Math.cos(angle)*400;
        dy = Math.sin(angle)*400;
        tekitama.push(new tekiTama(0,obj.x,obj.y,dx,dy));
    }
    
    //スプライトの変更
    const ptn = [44,45,44,46];
    obj.sn = ptn[(obj.count>>3)%4];
}

let tekiFunc = 
[
    tekiMove01,
    tekiMove02,
    tekiMove03,
    tekiMove04,
];

function tekiShot(obj,speed)
{
    if(gameOver)return;
    if(Math.abs(jiki.y-obj.y)< (100<<8) && !obj.flag)
        {
            obj.flag = true;

            let angle,dx,dy;
            angle = Math.atan2(jiki.y - obj.y, jiki.x-obj.x);
            
            angle += rand(-10,10)*Math.PI/180;
            dx = Math.cos(angle)*speed;
            dy = Math.sin(angle)*speed;
            tekitama.push(new tekiTama(0,obj.x,obj.y,dx,dy));
        }
}

function lifePoint(obj)
{
    if(!gameOver && !jiki.muteki && checkHit(obj.x,obj.y,obj.r,jiki.x,jiki.y,jiki.r))   
        {
            
                obj.kill = true;
                explosion(obj.x,obj.y,obj.vx>>3,obj.vy>>3);
            
            if((jiki.hp -= 30) <=0)
            {
                gameOver = true;
            }else
            {
                jiki.damege = 10;
                jiki.muteki = 60; 
            }
                       
        }
}