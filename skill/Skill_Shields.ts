/*
 * Skill_Shields_6.ts
 * author: Hotaru
 * 2023/9/30
 * 获得护盾(前后左右或自己)
 */
import { _decorator, Component, debug, log, Node } from 'cc';
import { SkillBase,Event, RoleInfo,SkillTriggerBase, } from './skill_base';
import { Battle } from '../battle';
import { Team } from '../team';
import { Role} from '../role';
import * as enums from '../enum';
import { random } from '../util';
import { Buffer } from '../buffer/buffer';
import { Direction } from '../common';

export class Skill_Shields extends SkillBase 
{
    public res:string="battle/skill/Skill_Shields.ts";
    public SkillType:enums.SkillType=enums.SkillType.Support;

    private value:number;
    private round:number;
    private dir:Direction;
    private eventSound:string;

    event:Event=new Event();

    public constructor(priority:number, value:number,round:number,dir:Direction,eventSound?:string) {
        super(priority);

        this.value=value;
        this.round=round;
        this.dir=dir;
        if(null!=eventSound){
            this.eventSound=eventSound;
        }
    }

    public UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void 
    {
        try
        {
            this.SkillEffect_1(selfInfo,battle,isParallel);          
        }
        catch (error) 
        {
            console.warn(this.res+"下的 UseSkill 错误");
        }
        
    }

    SkillEffect_1(selfInfo: RoleInfo, battle: Battle,isPar:boolean):void
    {
        try 
        {
            let teamTemp:Role[]=null;
            let recipientRole:Role=null;
            let event = new Event();
            event.isParallel=isPar;
            event.eventSound=this.eventSound;
            event.spellcaster=selfInfo;

            if(enums.Camp.Self==selfInfo.camp)
            {
            teamTemp=battle.GetSelfTeam().GetRoles();
            }
            if(enums.Camp.Enemy==selfInfo.camp)
            {
                teamTemp=battle.GetEnemyTeam().GetRoles();
            }
            switch (this.dir)
            {
                case 0:
                    recipientRole = teamTemp[selfInfo.index];
                    break;
                case 1:
                    if (selfInfo.index >= 3)
                    {
                        recipientRole = teamTemp[selfInfo.index - 3];
                    }
                    break;
                case 2:
                    if (selfInfo.index < 3)
                    {
                        recipientRole = teamTemp[selfInfo.index + 3];
                    }
                    break;
                case 3:
                    if (2 != selfInfo.index && 5 != selfInfo.index)
                    {
                        if (1 == selfInfo.index || 4 == selfInfo.index)
                        {
                            recipientRole = teamTemp[selfInfo.index - 3];
                        }
                        if (0 == selfInfo.index || 3 == selfInfo.index)
                        {
                            recipientRole = teamTemp[selfInfo.index + 2];
                        }
                    }
                    break;
                case 4:
                    if (1 != selfInfo.index && 4 != selfInfo.index)
                    {
                        if (0 == selfInfo.index || 3 == selfInfo.index)
                        {
                            recipientRole = battle.GetSelfTeam().GetRole(selfInfo.index + 1);
                        }
                        if (2 == selfInfo.index || 5 == selfInfo.index)
                        {
                            recipientRole = battle.GetSelfTeam().GetRole(selfInfo.index - 2);
                        }
                    }
            }
            if(null!=recipientRole)
            {
                let buff:Buffer=new Buffer();
                buff.BufferType=enums.BufferType.Shields;
                buff.Value=this.value;
                buff.Round=1;
                recipientRole.buffer.push(buff);

                let roleInfo:RoleInfo=new RoleInfo();
                roleInfo.camp=selfInfo.camp;
                roleInfo.index=recipientRole.index;

                event.type=enums.EventType.GiveShields;
                event.recipient.push(roleInfo);

                event.value = [this.value];
                battle.AddBattleEvent(event);
            }
        } 
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect 错误");
        }
        
    }
}
