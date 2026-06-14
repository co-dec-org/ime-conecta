import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide16(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 15);
}
