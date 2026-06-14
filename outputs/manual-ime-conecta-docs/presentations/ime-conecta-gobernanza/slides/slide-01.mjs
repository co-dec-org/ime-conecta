import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide01(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 0);
}
