/*
 * Skill_ChangePosition.ts
 * author: 未知
 * 2024/08/19
 * 交换位置
 */
import { _decorator, Component, error, Node } from 'cc';
import { SkillBase,Event, RoleInfo, SkillTriggerBase } from './skill_base';
import * as enums from '../enum';
import { Battle } from '../battle';
import { Role } from '../role';
import { random } from '../util';
import { Team } from '../team';
const { ccclass, property } = _decorator;

@ccclass('Skill_ChangePosition')
export class Skill_ChangePosition extends SkillBase {
    public res:string="battle/skill/Skill_ChangePosition.ts";

    private index1:number;
    private index2:number;
    private changeType : enums.ChangePositionType;

    private count=0;

    constructor(priority:number, changeType : enums.ChangePositionType, change1:number, change2:number)
    {
        super(priority);

        this.changeType = changeType;
        this.index1=change1;
        this.index2=change2;
    }


    UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void
    {
        try
        {
            let battleEvent : Event = new Event();
            battleEvent.type = enums.EventType.UsedSkill;
            battleEvent.spellcaster = selfInfo;
            battleEvent.recipient = [];
            battleEvent.value = [];
            battleEvent.isParallel=isParallel;

            battle.AddBattleEvent(battleEvent);

            if(enums.ChangePositionType.AssignChange == this.changeType)
            {
               this.SkillEffect_1(selfInfo,battle,isParallel);
            }
            if(enums.ChangePositionType.RandomChange == this.changeType)
            {
                this.SkillEffect_2(selfInfo,battle,isParallel);
            }
            if(enums.ChangePositionType.BackChange == this.changeType && this.count<1)
            {
                this.SkillEffect_3(selfInfo,battle,isParallel);
                this.count++;
            }
        }
        catch(e)
        {
            console.error(this.res + "下的" +  e + "异常");
        }
    }

    SkillEffect_1(_selfInfo: RoleInfo, _battle: Battle,_isPar:boolean)        //指定位置
    {
        try
        {
            let battleEvent : Event = new Event();
            battleEvent.type = enums.EventType.ChangeLocation;
            battleEvent.spellcaster = _selfInfo;
            battleEvent.recipient = [];
            battleEvent.value = [];
            battleEvent.isParallel=_isPar;
    
            let originalRoleList:Team = null;
            if(enums.Camp.Self==_selfInfo.camp)
            {
                originalRoleList=_battle.GetEnemyTeam();
            }
            if(enums.Camp.Enemy==_selfInfo.camp)
            {
                originalRoleList=_battle.GetSelfTeam();
            }
    
            //获取要交换的两个角色
            let begin = originalRoleList.GetRole(this.index1);
            let end = originalRoleList.GetRole(this.index2);
            let recipient;

            if(begin)
            {
                recipient = new RoleInfo();
                recipient.index = this.index1;
                recipient.camp = begin.selfCamp;
                battleEvent.recipient.push(recipient);
            }
           
            if(end)
            {
                recipient = new RoleInfo();
                recipient.index = this.index2;
                recipient.camp = end.selfCamp;
                battleEvent.recipient.push(recipient);
            }
            
    
            //提交要交换的位置信息
            battleEvent.value.push(this.index2);
            battleEvent.value.push(this.index1);
    
            if (enums.Camp.Self == _selfInfo.camp)
            {
                _battle.GetEnemyTeam().SwitchRole(begin.index, this.index2, end.index, this.index1);
            }
            if (enums.Camp.Enemy == _selfInfo.camp)
            {
                _battle.GetSelfTeam().SwitchRole(begin.index, this.index2, end.index, this.index1);
            }
    
            _battle.AddBattleEvent(battleEvent);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_1 错误 ",error);
        }
    }

    SkillEffect_2(_selfInfo: RoleInfo, _battle: Battle,_isPar:boolean)      //随机位置
    {
        try
        {
            let battleEvent: Event = new Event();
            battleEvent.type = enums.EventType.ChangeLocation;
            battleEvent.spellcaster = _selfInfo;
            battleEvent.recipient = [];
            battleEvent.value = [];
            battleEvent.isParallel = _isPar;
    
            let originalRoleList: Role[] = null;
            if (enums.Camp.Self == _selfInfo.camp)
            {
                originalRoleList = _battle.GetEnemyTeam().GetRoles().slice();
            }
            if (enums.Camp.Enemy == _selfInfo.camp)
            {
                originalRoleList = _battle.GetSelfTeam().GetRoles().slice();
            }
    
            if(originalRoleList.length<1)
            {
                return;
            }

            let recipientRoles: number[] = [];
            while (recipientRoles.length < 2 && recipientRoles.length < originalRoleList.length)
            {
                let index = random(0, originalRoleList.length);
                if (index in recipientRoles)
                {
                    continue;
                }
                recipientRoles.push(index);
            }
    
            let begin = originalRoleList[recipientRoles[0]];
            let end = originalRoleList[recipientRoles[1]];
    
            let recipient = new RoleInfo();
            recipient.index = recipientRoles[0];
            recipient.camp = begin.selfCamp;
            battleEvent.recipient.push(recipient);
    
            recipient = new RoleInfo();
            recipient.index = recipientRoles[1];
            recipient.camp = end.selfCamp;
            battleEvent.recipient.push(recipient);
    
            battleEvent.value.push(recipientRoles[1]);
            battleEvent.value.push(recipientRoles[0]);
    
            if (enums.Camp.Self == _selfInfo.camp)
            {
                _battle.GetEnemyTeam().SwitchRole(begin.index, recipientRoles[1], end.index, recipientRoles[0]);
            }
            if (enums.Camp.Enemy == _selfInfo.camp)
            {
                _battle.GetSelfTeam().SwitchRole(begin.index, recipientRoles[1], end.index, recipientRoles[0]);
            }
    
            _battle.AddBattleEvent(battleEvent);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_2 错误 ",error);
        }
    }

    SkillEffect_3(_selfInfo: RoleInfo, _battle: Battle,_isPar:boolean)      //随机后排推到前排
    {
        let battleEvent: Event = new Event();
        battleEvent.type = enums.EventType.ChangeLocation;
        battleEvent.spellcaster = _selfInfo;
        battleEvent.recipient = [];
        battleEvent.value = [];
        battleEvent.isParallel = _isPar;

        let originalRoleList: Team = null;
        if (enums.Camp.Self == _selfInfo.camp)
        {
            originalRoleList = _battle.GetEnemyTeam();
        }
        if (enums.Camp.Enemy == _selfInfo.camp)
        {
            originalRoleList = _battle.GetSelfTeam();
        }

        if(originalRoleList.GetRoles().length<4)
        {
            return;
        }

        let _index1 = random(3, originalRoleList.GetRoles().length);
        let _index2=_index1-3;

        let begin = originalRoleList.GetRole(_index1);
        let end = originalRoleList.GetRole(_index2);

        let recipient;

        if (begin)
        {
            recipient = new RoleInfo();
            recipient.index = _index1;
            recipient.camp = begin.selfCamp;
            battleEvent.recipient.push(recipient);
        }

        if (end)
        {
            recipient = new RoleInfo();
            recipient.index = _index2;
            recipient.camp = end.selfCamp;
            battleEvent.recipient.push(recipient);
        }

        battleEvent.value.push(_index2);
        battleEvent.value.push(_index1);

        if (enums.Camp.Self == _selfInfo.camp)
        {
            _battle.GetEnemyTeam().SwitchRole(begin.index, _index2, end.index, _index1);
        }
        if (enums.Camp.Enemy == _selfInfo.camp)
        {
            _battle.GetSelfTeam().SwitchRole(begin.index, _index2, end.index, _index1);
        }

        _battle.AddBattleEvent(battleEvent);
    }
}



