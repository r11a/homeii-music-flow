// @vitest-environment jsdom
import {it,expect,vi,afterEach} from 'vitest';
import {pcmFrame,dictateWithAssist} from '../src/core/media/assist-dictation.js';
const {document}=globalThis;
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers();});
it('encodes little-endian mono PCM with the assigned HA handler',()=>{
 expect([...pcmFrame(9,new Float32Array([-1,0,1]))]).toEqual([9,0,128,0,0,255,127]);
});
it('stops at transcription and releases microphone without intent or TTS',async()=>{
 vi.useFakeTimers();let callback;
 const stop=vi.fn(),close=vi.fn(async()=>{}),unsub=vi.fn(),send=vi.fn();
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:vi.fn(async()=>({getTracks:()=>[{stop}]}))}});
 const processor={connect:vi.fn(),disconnect:vi.fn()};
 vi.stubGlobal('AudioContext',class{sampleRate=48000;resume=vi.fn(async()=>{});close=close;createMediaStreamSource=()=>({connect:vi.fn(),disconnect:vi.fn()});createScriptProcessor=()=>processor;});
 const connection={socket:{readyState:1,send},subscribeMessage:vi.fn(async cb=>{callback=cb;return unsub;})};
 const card={_hass:{connection},_config:{announcement_assist_pipeline:'local'},_state:{},_m:x=>x,_i18n:x=>x,_toast:vi.fn(),_toastError:vi.fn()};
 const input=document.createElement('textarea');document.body.append(input);
 await dictateWithAssist(card,input);
 expect(connection.subscribeMessage.mock.calls[0][1]).toEqual({type:'assist_pipeline/run',start_stage:'stt',end_stage:'stt',input:{sample_rate:48000},timeout:30,pipeline:'local'});
 callback({type:'run-start',data:{runner_data:{stt_binary_handler_id:4}}});
 processor.onaudioprocess({inputBuffer:{getChannelData:()=>new Float32Array([.5])}});
 callback({type:'stt-end',data:{stt_output:{text:'Dinner is ready'}}});
 expect(input.value).toBe('Dinner is ready');expect(card._state.mobileAnnouncementText).toBe(input.value);
 expect(stop).toHaveBeenCalled();expect(close).toHaveBeenCalled();expect(unsub).toHaveBeenCalled();
 expect([...send.mock.calls.at(-1)[0]]).toEqual([4]);expect(card._voiceRecognition).toBeNull();input.remove();
});
