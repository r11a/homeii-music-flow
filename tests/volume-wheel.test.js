// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { openVolumeWheel } from "../src/core/media/player-volume.js";
const { document } = globalThis;

describe("rotary volume", () => {
  it("follows clockwise rotation, crosses the angle seam, and stops after release", () => {
    const root=document.createElement("div"); root.innerHTML='<div class="card"></div>';
    const player={entity_id:"media_player.test",state:"playing",attributes:{volume_level:.5,supported_features:4}};
    const card={shadowRoot:root,_state:{selectedPlayer:player.entity_id},_getSelectedPlayer:()=>player,_m:v=>v,_esc:v=>v,_iconSvg:()=>"",_isMuted:()=>false,_volumeIconName:()=>"volume_up",_setVolume:vi.fn()};
    openVolumeWheel(card);
    const dial=root.querySelector('[role="slider"]');
    dial.getBoundingClientRect=()=>({left:0,top:0,width:200,height:200}); dial.setPointerCapture=()=>{};
    const point=angle=>({clientX:100+90*Math.cos(angle),clientY:100+90*Math.sin(angle),pointerId:1,preventDefault(){}});
    dial.onpointerdown(point(Math.PI-.1)); dial.onpointermove(point(-Math.PI+.2));
    expect(card._setVolume.mock.lastCall[0]).toBeGreaterThan(.5);
    expect(card._setVolume.mock.lastCall[0]).toBeLessThan(.6);
    dial.onpointerup(); const calls=card._setVolume.mock.calls.length;
    dial.onpointermove(point(0)); expect(card._setVolume).toHaveBeenCalledTimes(calls);
  });
});

it("mutes the displayed fallback player and updates the icon after each command", async () => {
  const root=document.createElement("div"); root.innerHTML='<div class="card"></div>';
  const player={entity_id:"office",attributes:{volume_level:.5,supported_features:4,is_volume_muted:false}};
  const card={shadowRoot:root,_state:{selectedPlayer:null},_getSelectedPlayer:()=>player,_m:v=>v,_esc:v=>v,
    _iconSvg:v=>v,_isMuted:p=>p.attributes.is_volume_muted,
    _volumeIconName:p=>p.attributes.is_volume_muted ? "volume_mute" : "volume_up",
    _toggleMuteFor:vi.fn(async()=>{player.attributes.is_volume_muted=!player.attributes.is_volume_muted;})};
  openVolumeWheel(card);
  const button=root.querySelector('[data-volume-mute]');
  expect(button.textContent).toBe("volume_up");
  await button.onclick();
  expect(card._toggleMuteFor).toHaveBeenCalledWith("office");
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.textContent).toBe("volume_mute");
  await button.onclick();
  expect(button.getAttribute("aria-pressed")).toBe("false");
  card._getSelectedPlayer=()=>({entity_id:"other"});
  await button.onclick();
  expect(card._toggleMuteFor).toHaveBeenCalledTimes(2);
  expect(root.querySelector('.volume-wheel-popover')).toBeNull();
});
it("targets an explicitly chosen player without changing the selected player", async () => {
 const root=document.createElement('div');root.innerHTML='<div class="card"></div>';
 const kitchen={entity_id:'kitchen',attributes:{friendly_name:'Kitchen',volume_level:.46,supported_features:4}};
 const card={shadowRoot:root,_state:{selectedPlayer:'center'},_playerByEntityId:()=>kitchen,_getSelectedPlayer:()=>({entity_id:'center'}),_m:a=>a,_esc:String,_iconSvg:()=>'',_isMuted:()=>false,_volumeIconName:()=> 'volume_high',_setPlayerVolumeFor:vi.fn(),_toggleMuteFor:vi.fn(async()=>{})};
 openVolumeWheel(card,{entityId:'kitchen'});
 const dial=root.querySelector('[role="slider"]');dial.onkeydown({key:'ArrowRight',preventDefault(){}});
 expect(card._setPlayerVolumeFor).toHaveBeenCalledWith('kitchen',.48);
 await root.querySelector('[data-volume-mute]').onclick();expect(card._toggleMuteFor).toHaveBeenCalledWith('kitchen');
 expect(card._state.selectedPlayer).toBe('center');
});
it("uses group volume and mute commands for a group percentage", async () => {
 const root=document.createElement('div');root.innerHTML='<div class="card"></div>';
 const leader={entity_id:'center',attributes:{volume_level:.81,supported_features:4}};
 const card={shadowRoot:root,_state:{},_playerByEntityId:()=>leader,_groupAverageVolume:()=>64,_playerGroupMemberIds:()=>['center','kitchen'],_isGroupMuted:()=>false,_m:a=>a,_esc:String,_iconSvg:()=>'',_volumeIconName:()=> 'volume_high',_setGroupVolumeFor:vi.fn(),_toggleGroupMuteFor:vi.fn(async()=>{})};
 openVolumeWheel(card,{entityId:'center',group:true});
 root.querySelector('[role="slider"]').onkeydown({key:'ArrowLeft',preventDefault(){}});
 expect(card._setGroupVolumeFor).toHaveBeenCalledWith('center',.62);
 await root.querySelector('[data-volume-mute]').onclick();expect(card._toggleGroupMuteFor).toHaveBeenCalledWith('center');
});
