
//jiki.js 自機関連
//弾クラス
class Tama extends CharaBase
{
    constructor(x, y,vx,vy)
    {
        super(6,x,y,vx,vy);
        //this.w = 4;
        //this.h = 6;
        this.r = 4;
        this.power = 10;
    }

    update()
    {
        super.update();

        for(let i =0; i < teki.length; i++)
        {
            if(!teki[i].kill)
            {
                if(checkHit(
                    this.x,this.y,this.r,
                    teki[i].x,teki[i].y,teki[i].r
                ))
                {
                    this.kill = true;
                    /*
                    teki[i].kill = true;
                    explosion(teki[i].x,teki[i].y,teki[i].vx>>3,teki[i].vy>>3);
                    */
                    
                    if((teki[i].hp -= this.power) <=0)
                    {
                        teki[i].kill = true;
                        explosion(teki[i].x,teki[i].y,teki[i].vx>>3,teki[i].vy>>3);
                        score += teki[i].score;
                    }
                    else
                    {
                        expo.push(new Expo(0,this.x,this.y,this.vx>>3,this.vy>>3));
                    }

                    if(teki[i].mhp > 1000)
                    {
                        bossMHP = teki[i].mhp;
                        bossHP = teki[i].hp;
                    }
                    //break;
                }
            }
        }
        for(let i =0; i < tekitama.length; i++)
        {
            if(!tekitama[i].kill)
            {
                if(checkHit(
                    this.x,this.y,this.r,
                    tekitama[i].x,tekitama[i].y,tekitama[i].r
                ))
                {
                    tekitama[i].kill = true;
                    this.kill = true;
                    break;
                }
            }
        }
    }

    draw()
    {
        super.draw();
    }
}

class Jiki
{
    constructor()
    {
        this.x = (FIELD_W/2)<<8;
        this.y = (FIELD_H-50)<<8;

        this.mhp = 100;
        this.hp = this.mhp;
        this.speed = 512;
        this.anime = 0;
        this.reload =0;
        this.relo2 = 0;
        this.r = 10;
        this.damege = 0;
        this.muteki = 0;
        this.count = 0;
    }

    update()
    {
        this.count++;
        if(this.damege)this.damege--;
        if(this.muteki)this.muteki--;
        if(key[32] && this.reload == 0)
        {
            tama.push( new Tama(this.x+(4<<8),this.y-(10<<8),0,-2000));
            tama.push( new Tama(this.x-(4<<8),this.y-(10<<8),0,-2000));
            tama.push( new Tama(this.x+(8<<8),this.y-(10<<8),200,-2000));
            tama.push( new Tama(this.x-(8<<8),this.y-(10<<8),-200,-2000));
            //tama.push( new Tama(this.x+(4<<8),this.y-(80<<8),0,2000));
            //tama.push( new Tama(this.x-(4<<8),this.y-(80<<8),0,2000));
            //tama.push( new Tama(this.x+(8<<8),this.y-(80<<8),80,2000));
            //tama.push( new Tama(this.x-(8<<8),this.y-(80<<8),-80,2000));
            this.reload = 4;
            if(++this.relo2 == 4)
            {
                this.reload=20;
                this.relo2 =0;
            }
        }

        if(!key[32])this.reload = this.relo2 = 0;
        if(this.reload > 0)this.reload--;
        if(key[37] && this.x>this.speed)
        {
            this.x -= this.speed;
            if(this.anime>-8 )this.anime--;
        }
        else if(key[39] && this.x<= (FIELD_W<<8)-this.speed)
        {
            this.x += this.speed;
            if(this.anime<8 )this.anime++; //animeが足されて切り替わる時間を増やしてる
        } else
        {
            if(this.anime>0)this.anime--;
            if(this.anime<0)this.anime++;
        }
        if(key[38] && this.y>this.speed)
            this.y -= this.speed;
        
        if(key[40] && this.x<= (FIELD_H<<8)-this.speed)
            this.y += this.speed;
    }

    draw()
    {
        if(this.muteki && (this.count&1))return;
        drawSprite(2 + (this.anime>>2), this.x, this.y);
        if(this.muteki && (this.count&1))return;
        drawSprite(9 + (this.anime>>2), this.x, this.y+(24<<8));
    }
}