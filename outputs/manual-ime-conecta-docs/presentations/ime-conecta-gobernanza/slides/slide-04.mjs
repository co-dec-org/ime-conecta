import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide04(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 3);
}
