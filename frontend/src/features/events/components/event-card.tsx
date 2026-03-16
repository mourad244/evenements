import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";

import type { EventCardModel } from "../types/event.types";

type EventCardProps = {
  event: EventCardModel;
};

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="group overflow-hidden border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] p-0 shadow-[0_24px_56px_rgba(0,0,0,0.3)] transition-[transform,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_30px_68px_rgba(17,28,66,0.34)] hover:border-[rgba(88,116,255,0.24)]">
      <div className="relative h-48 w-full">
        <Image
          src={event.imageUrl || "/images/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.02),rgba(5,7,13,0.38))] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(5,7,13,0.01),rgba(5,7,13,0.28))]" />
      </div>
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge>{event.theme}</Badge>
          <span className="rounded-full border border-[rgba(243,154,99,0.18)] bg-[rgba(243,154,99,0.1)] px-3 py-1 text-sm font-semibold text-[var(--accent-warm)]">
            {event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}
          </span>
        </div>
        <div className="grid gap-2.5">
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {event.title}
          </h3>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{event.description}</p>
        </div>
        <div className="grid gap-2 rounded-[24px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] p-4 text-sm text-[var(--text-secondary)] transition-[border-color,background-color] duration-300 ease-out group-hover:border-[rgba(88,116,255,0.18)] group-hover:bg-[rgba(14,23,39,0.84)]">
          <p className="font-medium text-[var(--text-primary)]">
            {event.city} | {event.venue}
          </p>
          <p className="text-[var(--text-muted)]">{formatDate(event.startAt)}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-[24px] border border-[var(--line-soft)] bg-[rgba(10,17,30,0.84)] p-4 transition-[border-color,background-color] duration-300 ease-out group-hover:border-[rgba(243,154,99,0.18)] group-hover:bg-[rgba(12,20,35,0.92)] sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Discovery
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Open the full event view for the schedule, snapshot, and registration access.
            </p>
          </div>
          <Link href={`${ROUTES.events}/${event.id}`} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              View details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
