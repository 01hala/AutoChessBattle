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
import * as config from '../config/config';

export class Skill_AddBuff extends SkillBase 
{
    public res:string="battle/skill/Skill_RemoteAtk.ts/Skill_AddBuff";

    private buffID:number;
    private value:number;
    private round:number;

    private numberOfRole : number;
    private isAll:boolean;
    private eventSound:string;

    private frequency:number=0;

    /**
     * 
     * @param priority 优先权
     * @param buffID buffID
     * @param value buff数值（如生效次数）
     * @param round 生效回合
     * @param numberOfRole 生效角色数量
     * @param eventSound event音效
     */
    constructor(priority:number, buffID:number , value:number , round:number ,numberOfRole:number ,eventSound?:string)
    {
        super(priority);
        if(numberOfRole>=12) this.isAll=true;
        else this.isAll=false;

        this.buffID=buffID;
        this.value=value;
        this.round=round;
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

    SkillEffect_1(_selfInfo: RoleInfo, _battle: Battle,_isPar:boolean)      //随机对象套buff
    {
        let battleEvent: Event = new Event();
        battleEvent.type = enums.EventType.AddBuff;
        battleEvent.spellcaster = _selfInfo;
        battleEvent.recipient = [];
        battleEvent.value = [this.buffID , this.value , this.round];
        battleEvent.isParallel = _isPar;

        let enemyRoles:Role[] = null;
        let recipientRoles: Role[] = null;

        if (enums.Camp.Self == _selfInfo.camp)
        {
            enemyRoles = _battle.GetEnemyTeam().GetRoles();
        }
        if (enums.Camp.Enemy == _selfInfo.camp)
        {
            enemyRoles = _battle.GetSelfTeam().GetRoles();
        }

        let bufferConfig = config.config.BufferConfig.get(this.buffID);
        if(enums.BufferType.OffsetDamage==bufferConfig.Type || enums.BufferType.InevitableKill == bufferConfig.Type)
        {
            this.frequency=this.value;
        }

        while (recipientRoles.length < this.numberOfRole && enemyRoles.length > 0) 
        {
            let index = random(0, enemyRoles.length);
            if (enemyRoles[index].CheckDead() && !enemyRoles[index].getShields())
            {
                continue;
            }
            recipientRoles.push(enemyRoles[index]);
            enemyRoles.splice(index, 1);
        }

        for (let r of recipientRoles)
        {
            r.AddBuff(this.buffID , this.value , this.round ,this.frequency);

            let roleInfo: RoleInfo = new RoleInfo();
            roleInfo.camp = _selfInfo.camp;
            roleInfo.index = r.index;

            battleEvent.recipient.push(roleInfo);
        }

        _battle.AddBattleEvent(battleEvent);
    }
    
}


