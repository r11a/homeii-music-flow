// @vitest-environment jsdom
import {expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {interfaceIconNames,interfaceIconSvg} from "../src/core/ui-icons.js";

it("renders every interface symbol as accessible local SVG without text or remote assets",()=>{
  const host=globalThis.document.createElement("div");
  for(const name of interfaceIconNames){
    host.innerHTML=interfaceIconSvg(name);
    const svg=host.querySelector("svg");
    expect(svg?.getAttribute("viewBox"),name).toBe("0 0 24 24");
    expect(svg.getAttribute("aria-hidden"),name).toBe("true");
    expect(svg.getAttribute("stroke-width"),name).toBe("1.7");
    expect(svg.textContent,name).toBe("");
    expect(svg.querySelector("image,use,script,foreignObject"),name).toBeNull();
  }
});

it("rejects prototype names and markup instead of interpolating untrusted icon names",()=>{
  for(const name of ['__proto__','constructor','<svg onload="alert(1)">','missing-icon']) expect(interfaceIconSvg(name)).toBe("");
});

it("covers the static interface icon calls while retaining distinct media actions",()=>{
  const files=['src/core/base-music-card.js','src/core/media/action-menu.js','src/homeii-music-flow.js'];
  for(const file of files){
    const source=readFileSync(file,'utf8');
    for(const match of source.matchAll(/(?:_iconSvg\(|actionIconSvg\([^,]+,\s*)["']([a-z_]+)["']/g)) expect(interfaceIconSvg(match[1]),match[1]).not.toBe("");
  }
  for(const [a,b] of [['queue','library'],['queue_add','playlist_add'],['shuffle','crossfade'],['speaker','speaker_group']]) expect(interfaceIconSvg(a)).not.toBe(interfaceIconSvg(b));
});
