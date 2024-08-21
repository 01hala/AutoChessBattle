/*
 * Skill_AddBuff.ts
 * author: Hotaru
 * 2023/08/21
 * 套buff
 */
import { _decorator, Component, Node } from 'cc';
import { SkillBase,Event, RoleInfo, SkillTriggerBase } from './skill_base';
import * as enums from '../enum';
import { Battle } from '../battle';
import { Role } from '../role';
import { random } from '../util';

export class Skill_AddBuff extends SkillBase 
{
    public res:string="battle/skill/Skill_RemoteAtk.ts/Skill_AddBuff";

    private buffID:number;

    private numberOfRole : number;
    private isAll:boolean;
    private eventSound:string;

    constructor(priority:number, buffID ,numberOfRole:number ,eventSound?:string)
    {
        super(priority);
        if(numberOfRole>=12) this.isAll=true;
        else this.isAll=false;

        this.buffID=buffID;
        this.numberOfRole = numberOfRole;

        if(null!=eventSound){
            this.eventSound=eventSound;
        }
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle, isParallel: boolean, evs?: Event[]): void
    {
        try
        {
            if(!this.isAll)
            {
                this.SkillEffect_1(selfInfo,battle,isParallel);
            }
            
        }
        catch(error)
        {
            console.warn(this.res+"下的 UseSkill 错误");
        }
    }

    SkillEffect_1(_selfInfo: RoleInfo, _battle: Battle,_isPar:boolean)      //随机一名对象套buff
    {
        let battleEvent: Event = new Event();
        battleEvent.type = enums.EventType.AddBuff;
        battleEvent.spellcaster = _selfInfo;
        battleEvent.recipient = [];
        battleEvent.value = [this.buffID];
        battleEvent.isParallel = _isPar;

        let enemyRoles:Role[] = null;

        if (enums.Camp.Self == _selfInfo.camp)
        {
            enemyRoles = _battle.GetEnemyTeam().GetRoles();
        }
        if (enums.Camp.Enemy == _selfInfo.camp)
        {
            enemyRoles = _battle.GetSelfTeam().GetRoles();
        }

        let index = random(0, enemyRoles.length);

        let enemy:RoleInfo=new RoleInfo;
        enemy.camp=enemyRoles[index].selfCamp;
        enemy.index=enemyRoles[index].index;
        battleEvent.recipient.push(enemy);

        enemyRoles[index].AddBuff(this.buffID);

        _battle.AddBattleEvent(battleEvent);
    }
    
}


