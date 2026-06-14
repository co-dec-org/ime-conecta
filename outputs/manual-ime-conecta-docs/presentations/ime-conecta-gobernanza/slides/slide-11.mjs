import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide11(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 10);
}
