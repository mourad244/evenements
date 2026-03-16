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
    <Card className="overflow-hidden p-0">
      <div className="relative h-48 w-full">
        <Image
          src={event.imageUrl || "/images/placeholder-event.jpg"}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="grid gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge>{event.theme}</Badge>
          <span className="text-sm font-semibold text-brand-700">
            {event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}
          </span>
        </div>
        <div className="grid gap-2">
          <h3 className="text-xl font-semibold text-ink">{event.title}</h3>
          <p className="text-sm text-slate-600">{event.description}</p>
        </div>
        <div className="grid gap-1 text-sm text-slate-500">
          <p>
            {event.city} | {event.venue}
          </p>
          <p>{formatDate(event.startAt)}</p>
        </div>
        <Link href={`${ROUTES.events}/${event.id}`} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            View details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
