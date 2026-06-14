import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide10(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 9);
}
