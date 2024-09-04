/*
 * Skill_SwapProperties.ts
 * author: Guanliu
 * 2023/9/30
 * 交换队伍中指定两个位置上的角色的属性，若有交换方不存在则不交换
 */
import { _decorator, Component, debug, log, Node, ValueType } from 'cc';
import { SkillBase,Event, RoleInfo,SkillTriggerBase } from './skill_base';
import { Battle } from '../battle';
import { Team } from '../team';
import { Role } from '../role';
import * as enums from '../enum';
import { random } from '../util';

export class Skill_SwapProperties extends SkillBase 
{
    public res:string="battle/skill/Skill_SwapProperties.ts/Skill_SwapProperties";
    public SkillType:enums.SkillType=enums.SkillType.SwapProperties;

    event:Event=new Event();

    private type:enums.SwapPropertiesType;
    private index1:number;
    private index2:number;
    public constructor(priority:number, type:enums.SwapPropertiesType, swapper1:number,swapper2:number) {
        super(priority);

        this.type = type;
        this.index1=swapper1;
        this.index2=swapper2;
    }

    public UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void 
    {
        try
        {
            this.SkillEffect(selfInfo,battle,isParallel);          
        }
        catch (error) 
        {
            console.warn(this.res+"下的 UseSkill 错误", error);
        }
        
    }

    private SkillEffect(selfInfo: RoleInfo, battle: Battle,isPar:boolean):void
    {
        try
        {
            let event = new Event();
            event.type = enums.EventType.SwapProperties;
            event.spellcaster = selfInfo;
            event.recipient = [];
            event.isParallel=isPar;

            if (enums.SwapPropertiesType.SelfSwap == this.type) {
                let swapRole:Role = null;
                if(enums.Camp.Self==selfInfo.camp){
                    swapRole = battle.GetSelfTeam().GetRole(selfInfo.index);
                }
                if(enums.Camp.Enemy==selfInfo.camp){
                    swapRole = battle.GetEnemyTeam().GetRole(selfInfo.index);
                }
                if (!swapRole) {
                    return;
                }

                let hp = swapRole.GetProperty(enums.Property.HP);
                let attack = swapRole.GetProperty(enums.Property.Attack);
                swapRole.ChangeProperties(enums.Property.HP, attack);
                swapRole.ChangeProperties(enums.Property.Attack, hp);

                event.value = [enums.SwapPropertiesType.SelfSwap];
            }
            else if (enums.SwapPropertiesType.AssignSwap == this.type) {
                let swapRoles:Role[];
                if(enums.Camp.Self==selfInfo.camp){
                    swapRoles.push(battle.GetSelfTeam().GetRole(this.index1));
                    swapRoles.push(battle.GetSelfTeam().GetRole(this.index2));
                }
                if(enums.Camp.Enemy==selfInfo.camp){
                    swapRoles.push(battle.GetEnemyTeam().GetRole(this.index1));
                    swapRoles.push(battle.GetEnemyTeam().GetRole(this.index2));
                }
                if(!swapRoles[0] || !swapRoles[1]) {
                    return;
                }

                let temp=swapRoles[0].GetProperties();
                temp.forEach((value,key)=>{
                    swapRoles[0].ChangeProperties(key,swapRoles[1].GetProperty(key));
                    swapRoles[1].ChangeProperties(key,value);
                });

                event.value = [enums.SwapPropertiesType.AssignSwap, this.index1, this.index2];
            }
            else if (enums.SwapPropertiesType.RandomSwap == this.type) {
                let swapRoles:Role[];
                let rolesTemp:Role[]=null;

                event.value = [enums.SwapPropertiesType.AssignSwap];

                let original:Role[] = null;
                if(enums.Camp.Self==selfInfo.camp) {
                    rolesTemp=battle.GetSelfTeam().GetRoles().slice();
                    original = battle.GetSelfTeam().GetRoles();
                }
                else if(enums.Camp.Enemy==selfInfo.camp) {
                    rolesTemp=battle.GetEnemyTeam().GetRoles().slice();
                    original = battle.GetSelfTeam().GetRoles();
                }
                while(swapRoles.length<2 && rolesTemp.length > 0) {
                    let index = random(0, rolesTemp.length);
                    if(index!=selfInfo.index) {
                        swapRoles.push(rolesTemp[index]);
                        rolesTemp.splice(index, 1);
                    }
                }
                if (swapRoles.length<2) {
                    return;
                }

                let temp=swapRoles[0].GetProperties();
                temp.forEach((value,key)=>{
                    swapRoles[0].ChangeProperties(key,swapRoles[1].GetProperty(key));
                    swapRoles[1].ChangeProperties(key,value);
                });

                event.value.push(swapRoles[0].index);
                event.value.push(swapRoles[1].index);
            }
            battle.AddBattleEvent(event);
        }
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect 错误", error);
        }
    }
}

/**
 * 单方面替换属性
 */
export class Skill_SwapPropertiesSingle extends SkillBase 
{
    public res:string="battle/skill/Skill_SwapProperties.ts/Skill_SwapPropertiesSingle";
    public SkillType:enums.SkillType=enums.SkillType.SwapProperties;

    private type:enums.SwapPropertiesType;
    private value:number;

    public constructor(priority:number, type:enums.SwapPropertiesType, value) {
        super(priority);

        this.type = type;
        this.value=value;
    }

    UseSkill(selfInfo: RoleInfo, battle: Battle, isParallel: boolean): void
    {
        let event = new Event();
        event.type = enums.EventType.UsedSkill;
        event.spellcaster = selfInfo;
        event.recipient = [];
        event.isParallel = isParallel;

        battle.AddBattleEvent(event);

        if(enums.SwapPropertiesType.HpSwap == this.type)
        {
            this.SkillEffect_1(selfInfo,battle,isParallel);
        }
        if(enums.SwapPropertiesType.AttackSwap == this.type)
        {
            this.SkillEffect_2(selfInfo,battle,isParallel);
        }
    }

    SkillEffect_1(_selfInfo: RoleInfo, _battle: Battle, _isPar: boolean)        //生命交换到攻击
    {
        try
        {
            let event = new Event();
            event.type = enums.EventType.SwapProperties;
            event.spellcaster = _selfInfo;
            event.recipient = [];
            event.isParallel=_isPar;

            let swapRole:Role = null;
            if(enums.Camp.Self==_selfInfo.camp){
                swapRole = _battle.GetSelfTeam().GetRole(_selfInfo.index);
            }
            if(enums.Camp.Enemy==_selfInfo.camp){
                swapRole = _battle.GetEnemyTeam().GetRole(_selfInfo.index);
            }
            if (!swapRole) 
            {
                return;
            }

            let hp = swapRole.GetProperty(enums.Property.HP) + this.value;
            swapRole.ChangeProperties(enums.Property.Attack, hp);

            event.value = [enums.SwapPropertiesType.HpSwap];
            _battle.AddBattleEvent(event);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_1 错误", error);
        }
    }

    SkillEffect_2(_selfInfo: RoleInfo, _battle: Battle, _isPar: boolean)        //攻击交换到生命值
    {
        try
        {
            let event = new Event();
            event.type = enums.EventType.SwapProperties;
            event.spellcaster = _selfInfo;
            event.recipient = [];
            event.isParallel=_isPar;

            let swapRole:Role = null;
            if(enums.Camp.Self==_selfInfo.camp){
                swapRole = _battle.GetSelfTeam().GetRole(_selfInfo.index);
            }
            if(enums.Camp.Enemy==_selfInfo.camp){
                swapRole = _battle.GetEnemyTeam().GetRole(_selfInfo.index);
            }
            if (!swapRole) 
            {
                return;
            }

            let Attack = swapRole.GetProperty(enums.Property.Attack) + this.value;
            swapRole.ChangeProperties(enums.Property.HP, Attack);

            event.value = [enums.SwapPropertiesType.AttackSwap];
            _battle.AddBattleEvent(event);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_2 错误", error);
        }
    }

    
}

