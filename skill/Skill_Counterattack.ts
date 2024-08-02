/*
 * Skill_Counterattack
 * author: Hotaru
 * 2024/07/22
 * 亡语
 */
import { _decorator, Component, error, Node } from 'cc';
import { SkillBase,Event, RoleInfo, SkillTriggerBase } from './skill_base';
import { Battle } from '../battle';
import { Role } from '../role';
import { random } from '../util';
import * as enums from '../enum'

export class Skill_Counterattack extends SkillBase 
{
    public res:string="battle/skill/Skill_Counterattack.ts";

    private numberOfRole : number;
    private attack : number;
    private isAll:boolean;
    private eventSound;

    constructor(priority: number, numberOfRole: number, attack: number, isAll: boolean, eventSound?: string)
    {
        super(priority);

        this.numberOfRole = numberOfRole;
        this.attack = attack;
        this.isAll = isAll;
        if (null != eventSound)
        {
            this.eventSound = eventSound;
        }
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle, isParallel: boolean): void
    {
        try
        {
            this.SkillEffect_1(selfInfo,battle,this.attack,isParallel);
        }
        catch(error)
        {
            console.error(this.res + "下的 UseSkill 异常: ",error);
        }
    }

    SkillEffect_1(selfInfo: RoleInfo, battle: Battle,attack:number,isPar:boolean)
    {
        let self:Role;
        let enemy:Role;

        if(enums.Camp.Self==selfInfo.camp)
        {
            self = battle.GetSelfTeam().GetRole(selfInfo.index);
            enemy=battle.GetEnemyTeam().GetRole(self.foeRoleIndex);
        }
        if(enums.Camp.Enemy==selfInfo.camp)
        {
            self = battle.GetEnemyTeam().GetRole(selfInfo.index);
            enemy=battle.GetSelfTeam().GetRole(self.foeRoleIndex);
        }

        if(enemy)
        {
            enemy.BeHurted(self.GetProperty(enums.Property.Attack),self,battle,enums.EventType.AttackInjured,isPar);
        }
    }     
}


