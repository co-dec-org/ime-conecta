import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide03(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 2);
}
