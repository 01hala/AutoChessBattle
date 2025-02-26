/*
 * create_equip_skill.ts
 * author: qianqians
 * 2025/2/26
 */
import * as config from './config/config'
import * as enums from './BattleEnums'
import * as common from './common'
import * as skill from './skill/skill_base'
import * as Skill_Summon from './skill/Skill_Summon'
import * as create_trigger from './create_trigger'
import {SkillInfo} from './role'

enum EquipEffectEM{
    AddHP = 1,                      //提高生命值
    AddAttack = 2,                  //提高攻击力
    DeDamage = 3,                   //抵抗伤害
    Summon = 7,                     //召唤
    AdditionalAttack = 8,           //额外伤害
    Resurrect = 9,                  //复活  
    AddArmor = 10,                  //额外护甲
    Die = 11,                       //即死
    ImmuneFatalDamage = 12,         //免疫致命伤害
    FirstAttackDoubleDamage = 13,   //首次攻击双倍伤害
    PiercingDamage = 14,            //穿刺伤害
}

export function createEquipSkill(equipID:number) : SkillInfo {
    let skill = new SkillInfo();
    let equip = config.config.EquipConfig.get(equipID);

    switch(equip.Effect) {
        case EquipEffectEM.Summon:
            {
                let p = new Map<enums.Property, number>();
                p.set(enums.Property.HP, equip.Vaule[1]);
                p.set(enums.Property.TotalHP, equip.Vaule[1]);
                p.set(enums.Property.Attack, equip.Vaule[2]);
                skill.trigger = create_trigger.CreateTrigger(common.EMSkillEvent.syncope);
                skill.skill = new Skill_Summon.Skill_Summon(common.Priority.Normal, equip.Vaule[0], 1, p);
            }
            break;
    }

    return skill;
}