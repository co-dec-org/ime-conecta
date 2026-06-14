import type { TimelineItem } from "../data/content";

type TimelineProps = {
  timeline: TimelineItem[];
  renderText: (text: string) => React.ReactNode;
};

export default function Timeline({ timeline, renderText }: TimelineProps) {
  return (
    <div className="timeline">
      {timeline.map((period) => (
        <article key={period.label} className="timeline-item">
          <h3>{renderText(period.label)}</h3>
          <ul>
            {period.items.map((item) => (
              <li key={item}>{renderText(item)}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
