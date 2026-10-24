import {it,expect} from "vitest";
import {_currentSpeakerGroupMemberIds,_currentSpeakerGroupOwnerId} from "../src/core/media/speaker-groups.js";
import {playerGroupMemberIds,isStaticGroupPlayer} from "../src/core/state/players.js";
it("does not mistake configured static membership for an active sync group",()=>{
 const kitchen={entity_id:"kitchen",attributes:{mass_player_type:"player"}};
 const center={entity_id:"center",attributes:{mass_player_type:"player"}};
 const all={entity_id:"all",attributes:{mass_player_type:"group",group_members:["all","kitchen","center"]}};
 const card={_state:{players:[all,kitchen,center],selectedPlayer:"kitchen"},_playerByEntityId:id=>[all,kitchen,center].find(p=>p.entity_id===id),_playerGroupMemberIds:playerGroupMemberIds,_isStaticGroupPlayer:isStaticGroupPlayer};
 expect(_currentSpeakerGroupMemberIds.call(card)).toEqual(["kitchen"]);
 expect(_currentSpeakerGroupOwnerId.call(card)).toBe("kitchen");
 kitchen.attributes.group_members=["kitchen","center"];
 expect(_currentSpeakerGroupOwnerId.call(card,"center")).toBe("kitchen");
 expect(_currentSpeakerGroupMemberIds.call(card,"center")).toEqual(["kitchen","center"]);
});
it("recognizes a typed MA group without relying on an English room name",()=>{
 expect(isStaticGroupPlayer({entity_id:"media_player.house",attributes:{mass_player_type:"group"}})).toBe(true);
 expect(isStaticGroupPlayer({entity_id:"media_player.party",attributes:{mass_player_type:"player",group_members:["media_player.party","member"]}})).toBe(false);
});
