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
            let event = new Event();
            event.type = enums.EventType.IntensifierProperties;
            event.spellcaster = selfInfo;
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

            battle.AddBattleEvent(event)

        }
        catch(e)
        {
            console.error(this.res + "下的" +  e + "异常");
        }
    }
}


