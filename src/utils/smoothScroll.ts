let activeScrollFrame = 0;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const logisticEase = (progress: number) => {
  const intensity = 5.8;
  const sigmoid = (value: number) =>
    1 / (1 + Math.exp(-intensity * (value - 0.5)));
  const start = sigmoid(0);
  const end = sigmoid(1);

  return (sigmoid(progress) - start) / (end - start);
};

const getScrollMarginTop = (element: HTMLElement) => {
  const value = window.getComputedStyle(element).scrollMarginTop;
  const margin = Number.parseFloat(value);
  return Number.isFinite(margin) ? margin : 0;
};

export const smoothScrollToElement = (element: HTMLElement | null) => {
  if (!element || typeof window === "undefined") {
    return;
  }

  if (activeScrollFrame) {
    window.cancelAnimationFrame(activeScrollFrame);
  }

  const startY = window.scrollY;
  const targetY = Math.max(
    0,
    startY + element.getBoundingClientRect().top - getScrollMarginTop(element),
  );
  const distance = targetY - startY;

  if (prefersReducedMotion() || Math.abs(distance) < 2) {
    window.scrollTo(0, targetY);
    return;
  }

  const duration = Math.min(1320, Math.max(820, Math.abs(distance) * 0.7));
  const startedAt = window.performance.now();

  const animate = (timestamp: number) => {
    const elapsed = timestamp - startedAt;
    const progress = Math.min(1, elapsed / duration);
    const eased = logisticEase(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(animate);
      return;
    }

    activeScrollFrame = 0;
  };

  activeScrollFrame = window.requestAnimationFrame(animate);
};
