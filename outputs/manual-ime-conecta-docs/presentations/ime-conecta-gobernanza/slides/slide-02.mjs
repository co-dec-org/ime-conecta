import { addDeckSlide } from "../deck-helpers.mjs";

export async function slide02(presentation, ctx) {
  return addDeckSlide(presentation, ctx, 1);
}
