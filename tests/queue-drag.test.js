// @vitest-environment jsdom
import { afterEach, describe, it, expect, vi } from "vitest";
import { bindQueueDrag } from "../src/core/media/queue-drag.js";
const { document, MouseEvent } = globalThis;
afterEach(() => document.body.replaceChildren());
function fixture() {
  const body = document.createElement("div"); document.body.append(body);
  body.innerHTML = '<div class="queue-row" data-queue-item-id="a" data-queue-position="1"><button data-queue-drag>drag</button></div><div class="queue-row" data-queue-item-id="b" data-queue-position="2"></div>';
  [...body.children].forEach((row,i) => { row.getBoundingClientRect = () => ({ left:0,right:300,top:i*100,bottom:(i+1)*100 }); });
  const card = { _state:{ selectedPlayer:"computer",maQueueState:{queue_id:"q"} },_handleQueueAction:vi.fn().mockResolvedValue() };
  bindQueueDrag(card,body);
  const emit = (type,y,target=body.querySelector("button")) => target.dispatchEvent(new MouseEvent(type,{clientX:50,clientY:y,bubbles:true,cancelable:true}));
  return {card,body,emit};
}
describe("queue handle drag",()=>{
  it("moves through the existing queue command once, on release",()=>{
    const {card,emit}=fixture(); emit("pointerdown",30);emit("pointermove",150);
    expect(card._handleQueueAction).not.toHaveBeenCalled(); emit("pointerup",150);
    expect(card._handleQueueAction).toHaveBeenCalledWith("move_to","a","","",2);
  });
  it("does not reorder after cancellation or a player switch",()=>{
    const {card,emit}=fixture();emit("pointerdown",30);emit("pointermove",150);emit("pointercancel",150);emit("pointerup",150);
    expect(card._handleQueueAction).not.toHaveBeenCalled();
    emit("pointerdown",30);emit("pointermove",150);card._state.selectedPlayer="kitchen";emit("pointerup",150);
    expect(card._handleQueueAction).not.toHaveBeenCalled();
  });
});
