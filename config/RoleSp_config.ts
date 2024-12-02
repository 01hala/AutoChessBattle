import { JsonAsset, resources, error } from 'cc';
import * as enums from '../BattleEnums';
import { Direction, Priority } from '../common';

/**
 * @class 角色特效配置
 * @author Hotaru
 * @CreateTime 2024/11/27
 */
export class RoleSpConfig
{
    public Id: number;
    public IntensifierSelf:string;
    public OnSummon:string;
    public Skill:string;
}

export async function LoadRoleSpConfig() : Promise<Map<number, RoleSpConfig>>
{
    return new Promise((resolve)=>
    {
        let map = new Map<number, RoleSpConfig>();

        console.log("Load RoleSpEffect Config begin!");
        resources.load('config/RoleSpEffect', (err: any, res: JsonAsset) => 
        {
            if (err) {
                error(err.message || err);
                return;
            }

            const jsonData: object = res.json!;
            Object.keys(jsonData).forEach((k) =>
            {
                let v = jsonData[k];
    
                let cfg = new RoleSpConfig();
                cfg.Id = v["Id"];
                cfg.IntensifierSelf = v["IntensifierSelf"];
                cfg.OnSummon = v["OnSummon"];
                cfg.Skill = v["Skill"];
    
                map.set(parseInt(k), cfg);
            });
    
            console.log("Load Skill Config end!");
            resolve(map);
        });
    });
}

