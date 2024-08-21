/*
 * SkillTrigger_AfterAtk_9.ts
 * author: Guanliu
 * 2023/10/1
 * 触发条件：攻击后
 */
import { _decorator, Component, debug, log, Node, random } from 'cc';
import { SkillBase,Event, RoleInfo,SkillTriggerBase } from '../skill/skill_base';
import { Camp, EventType, SkillType } from '../enum';

export class SkillTrigger_AfterAtk extends SkillTriggerBase
{    
    public res:string="battle/skill/SkillTrigger_AfterAtk.ts";
    public EventType: EventType[];

    //目标触发次数
    private targetCnt:number;
    public count:number;

    event:Event=new Event();

    constructor(targetCnt?:number){
        super();
        this.EventType.push(EventType.AfterAttack);
        this.count=0;
        if(null != targetCnt){
            this.targetCnt=targetCnt;
        }
    }

    CheckSkillTrigger(frameEvent: Event[], selfInfo: RoleInfo): number {
        try
        {
            return this.CheckSkill(frameEvent,selfInfo);          
        }
        catch (error) 
        {
            console.warn(this.res+"下的 CheckSkillTrigger 错误");            
        }

        return 0;
    }

    private CheckSkill(frameEvent: Event[], selfInfo: RoleInfo): number
    {
        try
        {
            for (let element of frameEvent) {
                if(EventType.AfterAttack==element.type) 
                {
                    if(element.spellcaster.index == selfInfo.index && element.spellcaster.camp == selfInfo.camp)
                    {
                        return 1;
                    }
                    if(element.spellcaster.camp == selfInfo.camp && this.count==this.targetCnt)//友方攻击多少次后
                    {
                        return 1;
                    }
                    if(element.spellcaster.index != selfInfo.index && element.spellcaster.camp == selfInfo.camp)
                    {
                        this.count++;
                    }
                }
            }
        }
        catch (error) 
        {
            console.warn(this.res+"下的 CheckSkill 错误");
        }

        return 0;
    }
}


