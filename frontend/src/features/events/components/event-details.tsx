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
      <Card className="overflow-hidden p-0">
        <div className="relative h-72 w-full">
          <Image
            src={event.imageUrl || "/images/placeholder-event.jpg"}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid gap-5 p-5 sm:p-8">
          <Badge>{event.theme}</Badge>
          <div className="grid gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {event.title}
            </h1>
            <p className="text-base text-slate-600">{event.description}</p>
          </div>
          <div className="grid gap-2 text-sm text-slate-600">
            <p>
              {event.city} | {event.venue}
            </p>
            <p>{formatDate(event.startAt)}</p>
            {event.endAt ? <p>Ends {formatDate(event.endAt)}</p> : null}
          </div>
        </div>
      </Card>
      <Card className="grid gap-5 self-start">
        <h2 className="text-lg font-semibold text-ink">Event snapshot</h2>
        <dl className="grid gap-3 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-4">
            <dt>Price</dt>
            <dd>{event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Capacity</dt>
            <dd>{event.capacity}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt>Status</dt>
            <dd>
              <StatusBadge status={event.status} />
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
