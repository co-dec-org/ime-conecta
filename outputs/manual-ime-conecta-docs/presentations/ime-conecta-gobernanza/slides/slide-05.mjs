import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide05(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 4);
}
