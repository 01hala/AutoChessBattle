/*
 * Skill_AddTmpExp.ts
 * author: GuanLiu
 * 2023/3/1
 * 获得临时经验值（随机n人、前后左右或者自己）
 */
import { _decorator, Component, debug, log, Node } from 'cc';
import { SkillBase,Event, RoleInfo,SkillTriggerBase, } from './skill_base';
import { Battle } from '../battle';
import { Team } from '../team';
import { Role } from '../role';
import * as BattleEnums from '../BattleEnums'
import { Direction } from '../common'
import { random } from '../util';

export class Skill_AddTmpExp extends SkillBase 
{
    public res:string="battle/skill/Skill_AddTmpExp";
    public SkillType:BattleEnums.SkillType=BattleEnums.SkillType.Intensifier;

    private numberOfRole:number=null;
    private dir:Direction=null;
    private health:number;
    private attack:number;

    event:Event=new Event();

    public constructor(priority:number,health:number, attack:number,dir:Direction,numberOfRole?:number,isfetter:boolean=false) {
        super(priority,isfetter);

        this.attack = attack;
        this.health=health;
        if(null!=dir)
        {
            this.dir=dir;
        }
        if(null!=numberOfRole)
        {
            this.numberOfRole=numberOfRole;
        }
        
    }

    public UseSkill(selfInfo: RoleInfo, battle: Battle,isParallel:boolean): void 
    {
        try
        {
            let event: Event = new Event();
            event.isParallel = isParallel;
            event.spellcaster = selfInfo;
            event.type = BattleEnums.EventType.UsedSkill;
            battle.AddBattleEvent(event);
            if(!this.numberOfRole || 0==this.numberOfRole)
            {
                this.SkillEffect_1(selfInfo,battle,isParallel);    
            }
            else if(!this.dir)
            {
                this.SkillEffect_2(selfInfo,battle,isParallel);  
            }
                  
        }
        catch (error) 
        {
            console.warn(this.res+"下的 UseSkill 错误");
        }
        
    }

    SkillEffect_1(selfInfo: RoleInfo, battle: Battle,isPar:boolean):void          //指定某一对象生效
    {
        console.log("Skill_AddTmpExp SkillEffect_1! selfInfo:", selfInfo, " dir:", this.dir);
        try
        {
            let event = new Event();
            event.type = BattleEnums.EventType.IntensifierExp;
            event.spellcaster = selfInfo;
            event.recipient = [];
            event.isParallel=isPar;
            event.isFetter=this.isFetter;

            let teamTemp:Team=null;
            let recipientRole:Role=null;

            let roleInfo = new RoleInfo();
            roleInfo.camp = selfInfo.camp;
            roleInfo.index = 0;

            if(BattleEnums.Camp.Self==selfInfo.camp)
            {
                teamTemp=battle.GetSelfTeam();  
            }
            if(BattleEnums.Camp.Enemy==selfInfo.camp)
            {
                teamTemp=battle.GetEnemyTeam();
            }
            switch(this.dir)
                {
                    case Direction.None:
                        recipientRole=teamTemp.GetRole(selfInfo.index);
                        roleInfo.index = selfInfo.index;
                        break;
                    case Direction.Forward:
                        if(selfInfo.index>=3)
                        {
                            recipientRole=teamTemp.GetRole(selfInfo.index-3);
                            roleInfo.index = selfInfo.index-3;
                        }
                        break;
                    case Direction.Back:
                        if(selfInfo.index<3)
                        {
                            console.log("Skill_AttGain_1 SkillEffect_1! dir:", this.dir, " teamTemp:", teamTemp);
                            recipientRole=teamTemp.GetRole(selfInfo.index+3);
                            roleInfo.index = selfInfo.index+3;
                        }
                        break;
                    case Direction.Rigiht:
                        if(2!=selfInfo.index && 5!=selfInfo.index)
                        {
                            if(1==selfInfo.index||4==selfInfo.index)
                            {
                                recipientRole=teamTemp.GetRole(selfInfo.index-3);
                                roleInfo.index = selfInfo.index-3;
                            }
                            if(0==selfInfo.index||3==selfInfo.index)
                            {
                                recipientRole=teamTemp.GetRole(selfInfo.index+2);
                                roleInfo.index = selfInfo.index+2;
                            }
                        }
                        break;
                    case Direction.Left:
                        if(1!=selfInfo.index && 4!= selfInfo.index)
                        {
                            if(0==selfInfo.index||3==selfInfo.index)
                            {
                                recipientRole=teamTemp.GetRole(selfInfo.index+1);
                                roleInfo.index = selfInfo.index+1;
                            }
                            if(2==selfInfo.index||5==selfInfo.index)
                            {
                                recipientRole=teamTemp.GetRole(selfInfo.index-2);
                                roleInfo.index = selfInfo.index-2;
                            }
                        }
                        break;
                    default:
                        break;
                }
            
            if(null!=recipientRole)
            {
                console.log("recipientRole:", recipientRole, " ChangeProperties!");
                recipientRole.ChangeProperties(BattleEnums.Property.HP, recipientRole.GetProperty(BattleEnums.Property.HP) + this.health);
                recipientRole.ChangeProperties(BattleEnums.Property.TotalHP, recipientRole.GetProperty(BattleEnums.Property.TotalHP) + this.health);
                recipientRole.ChangeProperties(BattleEnums.Property.Attack,recipientRole.GetProperty(BattleEnums.Property.Attack) + this.attack);

                event.recipient.push(roleInfo);
                event.value = [this.health, this.attack];
                battle.AddBattleEvent(event);
            }
        }
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect_1 错误 ",error);
        }
    }

    SkillEffect_2(selfInfo: RoleInfo, battle: Battle,isPar:boolean):void          //随机一对象生效
    {
        console.log("Skill_AddTmpExp SkillEffect_2!");
        try
        {
            let event = new Event();
            event.type = BattleEnums.EventType.IntensifierExp;
            event.spellcaster = selfInfo;
            event.recipient = [];
            event.isFetter=this.isFetter;

            let recipientRoles:Role[]=new Array();
            let rolesTemp:Role[]=null;

            if(BattleEnums.Camp.Self==selfInfo.camp)
            {
                rolesTemp=battle.GetSelfTeam().GetRoles().slice();
            }
            if(BattleEnums.Camp.Enemy==selfInfo.camp)
            {
                rolesTemp=battle.GetEnemyTeam().GetRoles().slice();
            }
            while(recipientRoles.length<this.numberOfRole && recipientRoles.length<rolesTemp.length)
            {
                let index = random(0, rolesTemp.length);
                if(index!=selfInfo.index)                                   //随机但不包括自己
                {
                    recipientRoles.push(rolesTemp[index]);
                    rolesTemp.splice(index, 1);

                    let roleInfo = new RoleInfo();
                    roleInfo.camp = selfInfo.camp;
                    roleInfo.index = index;
                    event.recipient.push(roleInfo);
                }
            }
            recipientRoles.forEach((role) => 
            {
                console.log("recipientRoles role:", role, " ChangeProperties!");
                role.ChangeProperties(BattleEnums.Property.HP, role.GetProperty(BattleEnums.Property.HP) + this.health);
                role.ChangeProperties(BattleEnums.Property.TotalHP, role.GetProperty(BattleEnums.Property.TotalHP) + this.health);
                role.ChangeProperties(BattleEnums.Property.Attack,role.GetProperty(BattleEnums.Property.Attack) + this.attack);
            });
            event.value = [this.health,this.attack];
            battle.AddBattleEvent(event);
        }
        catch (error) 
        {
            console.warn(this.res+"下的 SkillEffect_2 错误 ",error);
        }
    }

/*
 * 添加相邻位置的角色生效
 * author: Hotaru
 * 2023/10/8
 */
    SkillEffect_3(selfInfo: RoleInfo, battle: Battle):void
    {
        try
        {
            let event = new Event();
            event.type = BattleEnums.EventType.IntensifierExp;
            event.spellcaster = selfInfo;
            event.recipient = [];
            event.isFetter=this.isFetter;

            let indexs:number[]=[];

            let rolesTemp:Role[]=[];

            if(BattleEnums.Camp.Self==selfInfo.camp)
            {
                rolesTemp=battle.GetSelfTeam().GetRoles().slice();
            }

            if(BattleEnums.Camp.Enemy==selfInfo.camp)
            {
                rolesTemp=battle.GetEnemyTeam().GetRoles().slice();
            }

            if(Direction.Cross==this.dir)
            {
                switch(selfInfo.index)
                {
                    case 0:
                        indexs.push(1,2,3);break;
                    case 1:
                        indexs.push(0,4);break;
                    case 2:
                        indexs.push(0,5);break;
                    case 3:
                        indexs.push(0,4,5);break;
                    case 4:
                        indexs.push(1,3);break;
                    case 5:
                        indexs.push(2,3);break;
                }
            }
            for(let i of indexs)
            {
                let roleInfo:RoleInfo=new RoleInfo();
                roleInfo.camp=selfInfo.camp;

                if(null!=rolesTemp[i])
                {
                    roleInfo.index=i;
                    event.recipient.push(roleInfo);
                }
            }
            event.value = [this.health, this.attack];
            battle.AddBattleEvent(event);
        }
        catch(error)
        {
            console.warn(this.res+"下的 SkillEffect_3 错误 ",error);
        }
        
    }
}


