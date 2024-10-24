/*
 * skill_base.ts
 * author: qianqians
 * 2023/9/24
 */
import * as enums from '../BattleEnums';
import * as battle from '../battle'
import { Role } from '../role';

export class RoleInfo {
    // public hp:number;
    // public attack:number;
    public properties:Map<enums.Property, number>;
    public camp : enums.Camp;
    public id:number;
    public index : number;
    public battleCount : number;
    public Fetters:number;
}

export class Event {
    public type : enums.EventType;
    /** 释放效果的对象 */
    public spellcaster : RoleInfo;
    /** 受到效果的对象 */
    public recipient : RoleInfo[];
    /** 生效范围 */
    public effectScope:number;
    /** 数值 */
    public value : number[];
    public is_trigger_floating : boolean = false;
    public priority:number=1;
    //是否是并行发动的
    public isParallel:boolean=false;
    public roleParallel:Role = null;
    //事件音效
    public eventSound:string="";
}

export abstract class SkillTriggerBase {
    abstract CheckSkillTrigger(frameEvent: Event[], selfInfo: RoleInfo , battle?:battle.Battle): number;
}

export abstract class SkillBase {
    public Priority : number = 0;
    public constructor(priority:number) {
        this.Priority = priority
    }

    abstract UseSkill(selfInfo: RoleInfo, battle: battle.Battle,isParallel:boolean , evs?:Event[]): void;
}