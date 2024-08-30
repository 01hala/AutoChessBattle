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
            console.log("使用技能：换位" , selfInfo.camp);
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
                _battle.GetEnemyTeam().SwitchRole(begin.index, end.index);
            }
            if (enums.Camp.Enemy == _selfInfo.camp)
            {
                _battle.GetSelfTeam().SwitchRole(begin.index, end.index);
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
    
            let originalRoleList:Role[];
            switch(_selfInfo.camp)
            {
                case enums.Camp.Self:
                    {
                        originalRoleList=_battle.GetEnemyTeam().GetRoles();
                    }
                    break;
                case enums.Camp.Enemy:
                    {
                        originalRoleList=_battle.GetSelfTeam().GetRoles();
                    }
                    break;
            }
    
            if(originalRoleList.length<1)
            {
                return;
            }

            
            let recipientRoles: number[] = [];
            let i=0;
            while (recipientRoles.length < 2 && recipientRoles.length < originalRoleList.length)
            {
                let index = random(0, originalRoleList.length);
                if (recipientRoles.includes(index) && i<originalRoleList.length)
                {
                    i++;
                    continue;
                }
                if(originalRoleList[index].CheckDead()&& i<originalRoleList.length)
                {
                    i++;
                    continue;
                }
                if(i>originalRoleList.length) break;
                recipientRoles.push(index);
                originalRoleList.splice(index, 1);
            }
            console.log("尝试换位",recipientRoles);

            switch (_selfInfo.camp)
            {
                case enums.Camp.Self:
                    {
                        originalRoleList = _battle.GetEnemyTeam().GetRoles();
                    }
                    break;
                case enums.Camp.Enemy:
                    {
                        originalRoleList = _battle.GetSelfTeam().GetRoles();
                    }
                    break;
            }

            let begin = originalRoleList[recipientRoles[0]];
            let end = originalRoleList[recipientRoles[1]];
    
            let recipient = new RoleInfo();
            recipient.index = begin.index;
            recipient.camp = begin.selfCamp;
            battleEvent.recipient.push(recipient);
    
            recipient = new RoleInfo();
            recipient.index = end.index;
            recipient.camp = end.selfCamp;
            battleEvent.recipient.push(recipient);
    
            battleEvent.value.push(end.index);
            battleEvent.value.push(begin.index);
    
            if (enums.Camp.Self == _selfInfo.camp)
            {
                _battle.GetEnemyTeam().SwitchRole(begin.index, end.index);
            }
            if (enums.Camp.Enemy == _selfInfo.camp)
            {
                _battle.GetSelfTeam().SwitchRole(begin.index, end.index);
            }
    
            _battle.AddBattleEvent(battleEvent);
            console.log("换位完成");
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

        let _indexs=[3,4,5];
        let _index1 = _indexs[random(0, 2)];
        let _index2=_index1-3;

        let begin = originalRoleList.GetRole(_index1);
        if(null == begin)
        {
            return;
        }
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
            _battle.GetEnemyTeam().SwitchRole(_index1, _index2);
        }
        if (enums.Camp.Enemy == _selfInfo.camp)
        {
            _battle.GetSelfTeam().SwitchRole(_index1, _index2);
        }

        _battle.AddBattleEvent(battleEvent);
    }
}



