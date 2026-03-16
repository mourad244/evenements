import Image from "next/image";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";

import type { EventItem } from "../types/event.types";

type EventDetailsProps = {
  event: EventItem;
};

export function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <Card className="overflow-hidden border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] p-0 shadow-[0_30px_70px_rgba(0,0,0,0.34)]">
        <div className="relative h-72 w-full">
          <Image
            src={event.imageUrl || "/images/placeholder-event.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.04),rgba(5,7,13,0.5))]" />
        </div>
        <div className="grid gap-6 p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{event.theme}</Badge>
            <StatusBadge status={event.status} />
          </div>
          <div className="grid gap-3.5">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              {event.title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
              {event.description}
            </p>
          </div>
          <div className="grid gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.76)] p-5 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              {event.city} | {event.venue}
            </p>
            <p>{formatDate(event.startAt)}</p>
            {event.endAt ? <p className="text-[var(--text-muted)]">Ends {formatDate(event.endAt)}</p> : null}
          </div>
        </div>
      </Card>
      <Card className="grid gap-5 self-start border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.16),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_62px_rgba(0,0,0,0.32)]">
        <div className="grid gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
            Event snapshot
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Plan your visit
          </h2>
        </div>
        <dl className="grid gap-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
            <dt className="text-[var(--text-muted)]">Price</dt>
            <dd className="font-semibold text-[var(--text-primary)]">
              {event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
            <dt className="text-[var(--text-muted)]">Capacity</dt>
            <dd className="font-semibold text-[var(--text-primary)]">{event.capacity}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
            <dt className="text-[var(--text-muted)]">Status</dt>
            <dd>
              <StatusBadge status={event.status} />
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
