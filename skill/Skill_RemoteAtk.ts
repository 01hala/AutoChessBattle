/*
 * Skill_RemoteAtk_3
 * author: Hotaru
 * 2023/9/25
 * 对N敌方随机单位造成M点远程伤害
 */
import { _decorator, Component, Node } from 'cc';
import { SkillBase,Event, RoleInfo, SkillTriggerBase } from './skill_base';
import * as enums from '../enum';
import { Battle } from '../battle';
import { Role } from '../role';
import { random } from '../util';

export class Skill_RemoteAtk extends SkillBase  
{
    public res:string="battle/skill/Skill_RemoteAtk.ts/Skill_RemoteAtk";
    public SkillType:enums.SkillType=enums.SkillType.Attack;

    private numberOfRole : number;
    private attack : number;
    private isAll:boolean;
    private eventSound:string;

    public constructor(priority:number, numberOfRole:number, attack:number,eventSound?:string) {
        super(priority);

        this.numberOfRole = numberOfRole;
        this.attack = attack;
        if(numberOfRole>=12) this.isAll=true;
        else this.isAll=false;

        if(null!=eventSound){
            this.eventSound=eventSound;
        }
        //this.event.type=EventType.RemoteInjured;
        console.log("create Skill_RemoteAtk_3 attack:", this.attack);
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void 
    {
        try 
        {
            let event: Event = new Event();
            event.isParallel = isParallel;
            event.eventSound = this.eventSound;
            event.spellcaster = selfInfo;
            event.type = enums.EventType.UsedSkill;

            battle.AddBattleEvent(event);

            if(!this.isAll)
            {
                this.SkillEffect_1(selfInfo,battle,isParallel);
            }

            else
            {
                this.SkillEffect_2(selfInfo,battle,isParallel);
            }
            
            
        } 
        catch (error) 
        {
            console.warn(this.res+"下的 UseSkill 错误");
        }   
    }

    private SkillEffect_1(selfInfo: RoleInfo, battle: Battle,isPar:boolean):void          //随机对象生效
    {
        try
        {
            console.log("try to use remote Skill_RemoteAtk_3 attack:", this.attack);

            let recipientRoles:Role[] = new Array();
            let self:Role = null;
            let enemyRoles:Role[] = null;

            if(enums.Camp.Self==selfInfo.camp)
            {
                self = battle.GetSelfTeam().GetRole(selfInfo.index);
                enemyRoles=battle.GetEnemyTeam().GetRoles().slice();
            }
            if(enums.Camp.Enemy==selfInfo.camp)
            {
                self = battle.GetEnemyTeam().GetRole(selfInfo.index);
                enemyRoles=battle.GetSelfTeam().GetRoles().slice();
            }
            while(recipientRoles.length < this.numberOfRole && enemyRoles.length > 0) {
                let index = random(0, enemyRoles.length);
                recipientRoles.push(enemyRoles[index]);
                enemyRoles.splice(index, 1);
            }
            recipientRoles.forEach((role)=>{
                role.BeHurted(this.attack, self, battle,enums.EventType.RemoteInjured,isPar);
                console.log("Skill_RemoteAtk_3 远程攻击角色受伤 :",this.attack);
            });

        }
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect 错误");
            console.log(error);
        }
    }

    private SkillEffect_2(selfInfo: RoleInfo, battle: Battle,isPar:boolean)         //场上全部生效
    {
        let self:Role=null;

        if(enums.Camp.Self==selfInfo.camp)
        {
            self=battle.GetSelfTeam().GetRole(selfInfo.index);
        }
        if(enums.Camp.Enemy==selfInfo.camp)
        {
            self=battle.GetEnemyTeam().GetRole(selfInfo.index);
        }

        let recipientRoles:Role[] = [];
        let selfRoles:Role[] = battle.GetSelfTeam().GetRoles();
        let enemyRoles:Role[] = battle.GetEnemyTeam().GetRoles();

        for (let t of selfRoles) 
        {
            if(t!=self) recipientRoles.push(t);
        }
        for (let t of enemyRoles)
        {
            if(t!=self) recipientRoles.push(t);
        }

        //同时发射子弹,同时受伤
        for(let role of recipientRoles)
        {
            role.BeHurted(this.attack, self, battle,enums.EventType.RemoteInjured,true)
        }

    }
}


/*
 * Skill_RemoteAtk_3_1
 * author: Hotaru
 * 2023/11/2
 * 对N敌方随机单位造成M点远程伤害(百分比)
 */

export class Skill_RemoteAtkPre extends SkillBase  
{
    
    public res:string="battle/skill/Skill_RemoteAtk.ts/Skill_RemoteAtkPre";
    public SkillType:enums.SkillType=enums.SkillType.Attack;

    private numberOfRole : number;
    private attack : number;
    private isAll:boolean;
    private eventSound;

    public constructor(priority:number, numberOfRole:number, attack:number,isAll:boolean,eventSound?:string) {
        super(priority);

        this.numberOfRole = numberOfRole;
        this.attack = attack;
        this.isAll=isAll;
        if(null!=eventSound){
            this.eventSound=eventSound;
        }

        //this.event.type=EventType.RemoteInjured;
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void 
    {
        try 
        {
            let event: Event = new Event();
            event.isParallel = isParallel;
            event.eventSound = this.eventSound;
            event.spellcaster = selfInfo;
            event.type = enums.EventType.UsedSkill;

            battle.AddBattleEvent(event);

            if(this.attack>0 && this.attack <=1)
            {
                if (6 >= this.numberOfRole && !this.isAll)
                {
                    this.SkillEffect_1(selfInfo, battle, this.attack * (1 + selfInfo.properties.get(enums.Property.Attack)), isParallel);
                }
                else
                {
                    console.warn("生效人数不能大于6人");
                }
                if(this.isAll)
                {
                    this.SkillEffect_2(selfInfo,battle,this.attack * (1 + selfInfo.properties.get(enums.Property.Attack)), isParallel);
                }
            }
            
        } 
        catch (error) 
        {
            console.warn(this.res+"下的 UseSkill 错误");
        }   
    }

    SkillEffect_1(selfInfo: RoleInfo, battle: Battle,attack:number,isPar:boolean)               //随机对象生效
    {
        try
        {
            let recipientRoles:Role[] = new Array();
            let self:Role = null;
            let enemyRoles:Role[] = null;

            attack=Math.round(attack);                                          //四舍五入
            if(attack<1)
            {
                attack=1;
            }
            console.log("try to use remote Skill_RemoteAtk_3_1 attack:", attack);

            if(enums.Camp.Self==selfInfo.camp)
            {
                self = battle.GetSelfTeam().GetRole(selfInfo.index);
                enemyRoles=battle.GetEnemyTeam().GetRoles().slice();
            }
            if(enums.Camp.Enemy==selfInfo.camp)
            {
                self = battle.GetEnemyTeam().GetRole(selfInfo.index);
                enemyRoles=battle.GetSelfTeam().GetRoles().slice();
            }
            while (recipientRoles.length < this.numberOfRole && enemyRoles.length > 0)
            {
                let index = random(0, enemyRoles.length);
                recipientRoles.push(enemyRoles[index]);
                enemyRoles.splice(index, 1);
            }
            recipientRoles.forEach((role) =>
            {
                role.BeHurted(attack, self, battle, enums.EventType.RemoteInjured, isPar);
                console.log("Skill_RemoteAtk_3_1 远程攻击角色受伤 :", attack);
            });

        }
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect 错误");
            console.log(error);
        }
    }

    SkillEffect_2(selfInfo: RoleInfo, battle: Battle,attack:number,isPar:boolean)
    {
        let self: Role = null;

        attack=Math.round(attack);                                          //四舍五入
        if(attack<1)
        {
            attack=1;
        }

        if (enums.Camp.Self == selfInfo.camp)
        {
            self = battle.GetSelfTeam().GetRole(selfInfo.index);
        }
        if (enums.Camp.Enemy == selfInfo.camp)
        {
            self = battle.GetEnemyTeam().GetRole(selfInfo.index);
        }

        let recipientRoles: Role[] = [];
        let selfRoles: Role[] = battle.GetSelfTeam().GetRoles();
        let enemyRoles: Role[] = battle.GetEnemyTeam().GetRoles();

        for (let t of selfRoles) 
        {
            if (t != self) recipientRoles.push(t);
        }
        for (let t of enemyRoles)
        {
            if (t != self) recipientRoles.push(t);
        }

        //同时发射子弹,同时受伤
        for (let role of recipientRoles)
        {
            role.BeHurted(attack, self, battle, enums.EventType.RemoteInjured, true)
        }

    }
}
