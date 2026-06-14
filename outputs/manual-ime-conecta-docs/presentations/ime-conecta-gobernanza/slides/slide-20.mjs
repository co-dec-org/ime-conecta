import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide20(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 19);
}
