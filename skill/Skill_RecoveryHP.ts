/*
 * Skill_RecoveryHP
 * author: ?
 * 2023/10/1
 * 恢复生命
 */

import { _decorator, Component, error, Node } from 'cc';
import { SkillBase,Event, RoleInfo, SkillTriggerBase } from './skill_base';
import * as enums from '../enum';
import { Battle } from '../battle';
import { Role } from '../role';
import { random } from '../util';
const { ccclass, property } = _decorator;

@ccclass('Skill_RecoveryHP')
export class Skill_RecoveryHP extends SkillBase {
    public res:string="battle/skill/Skill_RecoveryHP.ts";
    private numberOfRole:number;
    private effectiveValue : number;
    private eventSound:string;

    constructor(priority:number, numberOfRole:number, effectiveValue : number,eventSound?:string){
        super(priority);
        this.numberOfRole = numberOfRole;
        this.effectiveValue = effectiveValue;
        if(null!=eventSound){
            this.eventSound=eventSound;
        }
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void
    {
        try
        {
           if(this.numberOfRole<6)
           {
                this.SkillEffect_2(selfInfo , battle, isParallel);
           }
           if(6==this.numberOfRole)
           {
                this.SkillEffect_1(selfInfo , battle,true);
           }

        }
        catch(e)
        {
            console.error(this.res + "下的" +  e + "异常");
        }
    }

    SkillEffect_1(selfInfo: RoleInfo, battle: Battle,isPar:boolean)
    {
        try
        {
            let event = new Event();
            event.type = enums.EventType.IntensifierProperties;
            event.spellcaster = selfInfo;
            event.isParallel=isPar;
            event.recipient = [];
    
            let indexs: number[] = [];
    
            let rolesTemp: Role[] = [];
    
            if (enums.Camp.Self == selfInfo.camp)
            {
                rolesTemp = battle.GetSelfTeam().GetRoles().slice();
            }
    
            if (enums.Camp.Enemy == selfInfo.camp)
            {
                rolesTemp = battle.GetEnemyTeam().GetRoles().slice();
            }

            let recipientRoles:Role[]=new Array();
            for(let r of rolesTemp)
            {
                if(r!=null && r.index != selfInfo.index)
                {
                    recipientRoles.push(r);
                }
            }

            recipientRoles.forEach((role) => 
            {
                console.log("recipientRoles role:", role, " ChangeProperties!");
                role.ChangeProperties(enums.Property.HP, role.GetProperty(enums.Property.HP) + this.effectiveValue);
                role.ChangeProperties(enums.Property.TotalHP, role.GetProperty(enums.Property.TotalHP) + this.effectiveValue);
            });
    
            for(let r of rolesTemp)
            {
                if(r!=null && r.index != selfInfo.index)
                {
                    let roleInfo:RoleInfo=new RoleInfo();
                    roleInfo.camp=selfInfo.camp;
                    roleInfo.index=r.index;
                    event.recipient.push(roleInfo);
                }
            }
    
            event.value = [this.effectiveValue];
            event.effectScope=1;
            battle.AddBattleEvent(event);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_4 错误 ",error);
        }
    }

    SkillEffect_2(selfInfo: RoleInfo, battle: Battle,isPar:boolean)
    {
        let event = new Event();
        event.type = enums.EventType.IntensifierProperties;
        event.spellcaster = selfInfo;
        event.isParallel=isPar;
        event.recipient = [];

        let effectiveRole : Role[] = null;
        if(enums.Camp.Enemy == selfInfo.camp) {
            effectiveRole = battle.GetEnemyTeam().GetRoles().slice();
        }
        else if(enums.Camp.Self == selfInfo.camp) {
            effectiveRole = battle.GetSelfTeam().GetRoles().slice();
        }

        let recipientRoles:Role[] = [];
        while(recipientRoles.length < this.numberOfRole && effectiveRole.length > 0) {
            let index = random(0, effectiveRole.length);
            recipientRoles.push(effectiveRole[index]);
            effectiveRole.splice(index, 1);
        }

        for(const r of recipientRoles) {
            let totalHP = r.GetProperty(enums.Property.TotalHP);
            let HP = r.GetProperty(enums.Property.HP) + this.effectiveValue;
            if (HP > totalHP) {
                HP = totalHP;
            }
            battle.onPlaySound.call(null, this.eventSound);
            r.ChangeProperties(enums.Property.HP, HP);

            let tRoleInfo=new RoleInfo();
            tRoleInfo.id=r.id;
            tRoleInfo.index=r.index;
            tRoleInfo.properties=r.GetProperties();
            tRoleInfo.battleCount=r.selfCamp;

            event.recipient.push(tRoleInfo);
        }

        event.value = [this.effectiveValue];
        event.effectScope=1;
        battle.AddBattleEvent(event)
    }
}
