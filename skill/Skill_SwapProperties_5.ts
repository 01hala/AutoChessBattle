/*
 * Skill_SwapProperties_5.ts
 * author: Guanliu
 * 2023/9/30
 * 交换队伍中指定两个位置上的角色的属性，若有交换方不存在则不交换
 */
import { _decorator, Component, debug, log, Node, ValueType } from 'cc';
import { SkillBase,Event, RoleInfo,SkillTriggerBase } from './skill_base';
import { Battle } from '../battle';
import { Team } from '../team';
import { Role } from '../role';
import * as enums from '../../../other/enums';
import { random } from '../util';

export class Skill_SwapProperties_5 extends SkillBase 
{
    public res:string="battle/skill/Skill_SwapProperties_5";
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
            event.type = enums.EventType.ChangeLocation;
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


