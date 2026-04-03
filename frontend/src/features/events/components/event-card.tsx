"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";

import type { EventCardModel } from "../types/event.types";

type EventCardProps = {
  event: EventCardModel;
};

export function EventCard({ event }: EventCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(event.imageUrl) && !imgError;

  return (
    <Link href={`${ROUTES.events}/${event.id}`} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] rounded-[var(--radius-surface)]">
      <Card className="group flex h-full flex-col border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.3)] transition-[transform,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_30px_68px_rgba(17,28,66,0.34)] hover:border-[rgba(88,116,255,0.24)] cursor-pointer">

        {/* Image area — inset, fully rounded */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-[20px]">
          {hasImage ? (
            <Image
              src={event.imageUrl!}
              alt={event.title}
              fill
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(65,93,255,0.28)_0%,rgba(18,28,46,0.96)_50%,rgba(243,154,99,0.18)_100%)]" />
          )}
          {/* Bottom fade */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,15,26,0.04)_0%,rgba(9,15,26,0.14)_50%,rgba(9,15,26,0.72)_100%)]" />
          {/* Badges overlaid on image */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3">
            <Badge>{event.theme}</Badge>
            <span className="rounded-full border border-[rgba(243,154,99,0.28)] bg-[rgba(9,15,26,0.72)] px-3 py-1 text-sm font-semibold text-[var(--accent-warm)] backdrop-blur-sm">
              {event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}
            </span>
          </div>
        </div>

        {/* Card content — grows to fill remaining height */}
        <div className="flex flex-1 flex-col gap-4 pt-4">
          <div className="flex flex-1 flex-col gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] line-clamp-2">
              {event.title}
            </h3>
            <p className="text-sm leading-6 text-[var(--text-secondary)] line-clamp-2">
              {event.description}
            </p>
          </div>

          <div className="grid gap-2 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-[border-color,background-color] duration-300 group-hover:border-[rgba(88,116,255,0.18)] group-hover:bg-[rgba(14,23,39,0.84)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="grid gap-0.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Location
                </p>
                <p className="font-medium text-[var(--text-primary)]">
                  {event.city} · {event.venue}
                </p>
              </div>
              <div className="grid gap-0.5 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Date
                </p>
                <p className="text-[var(--text-primary)]">{formatDate(event.startAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
