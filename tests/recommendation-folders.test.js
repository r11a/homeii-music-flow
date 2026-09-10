// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { createHomeiiBaseMusicCard } from "../src/core/base-music-card.js";

it("loads MA 2.11 lazy recommendation rows and preserves already populated rows", async () => {
  const proto=createHomeiiBaseMusicCard({}).prototype;
  const track={uri:"spotify://track/one",media_type:"track",name:"One"};
  const folders=[{provider:"spotify",item_id:"for_you",media_type:"folder",name:"For you",items:[]},{provider:"library",item_id:"recent",items:[track]}];
  const card={_recommendationFolderItems:proto._recommendationFolderItems,_callEngineMaCommand:vi.fn(async(command)=>command==="music/recommendations"?folders:[track])};
  const result=await proto._loadRecommendationFolders.call(card);
  expect(card._callEngineMaCommand).toHaveBeenCalledTimes(2);
  expect(card._callEngineMaCommand).toHaveBeenLastCalledWith("music/recommendations/items",{provider:"spotify",item_id:"for_you"});
  expect(result[0].items).toEqual([track]); expect(result[1]).toBe(folders[1]);
});
