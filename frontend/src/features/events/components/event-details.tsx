"use client";

import { useState } from "react";
import Image from "next/image";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RegistrationButton } from "@/features/registrations/components/registration-button";
import { formatDate } from "@/lib/utils/format-date";
import { formatPrice } from "@/lib/utils/format-price";

import type { EventItem } from "../types/event.types";

type EventDetailsProps = {
  event: EventItem;
};

export function EventDetails({ event }: EventDetailsProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(event.imageUrl) && !imgError;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">

      {/* ── Left: main content card ── */}
      <Card className="overflow-hidden border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] shadow-[0_30px_70px_rgba(0,0,0,0.34)]">
        {/* Thumbnail image */}
        <div className="p-4 pb-0 sm:p-5 sm:pb-0">
          <div className="relative h-56 w-full overflow-hidden rounded-[20px] sm:h-72">
            {hasImage ? (
              <Image
                src={event.imageUrl!}
                alt={event.title}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(65,93,255,0.3)_0%,rgba(18,28,46,0.98)_55%,rgba(243,154,99,0.2)_100%)]" />
            )}
            {/* Soft vignette at the bottom of the image */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,15,26,0.04)_0%,rgba(9,15,26,0.18)_60%,rgba(9,15,26,0.72)_100%)]" />
            {/* Badges overlaid at bottom of image */}
            <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end gap-2 p-4">
              <Badge>{event.theme}</Badge>
              <StatusBadge status={event.status} />
            </div>
          </div>
        </div>

        {/* Title + description + info */}
        <div className="grid gap-6 p-5 sm:p-8">
          <div className="grid gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
              {event.title}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
              {event.description}
            </p>
          </div>
          <div className="grid gap-2 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.76)] p-5 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">
              {event.city} · {event.venue}
            </p>
            <p>{formatDate(event.startAt)}</p>
            {event.endAt ? (
              <p className="text-[var(--text-muted)]">Ends {formatDate(event.endAt)}</p>
            ) : null}
          </div>
        </div>
      </Card>

      {/* ── Right: snapshot + registration ── */}
      <div className="grid gap-4 lg:sticky lg:top-24">
        {/* Event snapshot */}
        <Card className="grid gap-4 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_62px_rgba(0,0,0,0.32)]">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
              Event details
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              Plan your visit
            </h2>
          </div>
          <dl className="grid gap-2.5 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
              <dt className="text-[var(--text-muted)]">Price</dt>
              <dd className="font-semibold text-[var(--text-primary)]">
                {event.price > 0 ? formatPrice(event.price, event.currency) : "Free"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
              <dt className="text-[var(--text-muted)]">Capacity</dt>
              <dd className="font-semibold text-[var(--text-primary)]">{event.capacity}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
              <dt className="text-[var(--text-muted)]">Status</dt>
              <dd>
                <StatusBadge status={event.status} />
              </dd>
            </div>
          </dl>
        </Card>

        {/* Registration CTA */}
        <Card className="grid gap-4 border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_26px_58px_rgba(17,28,66,0.28)]">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              Reserve your place
            </p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Secure your spot now — your ticket and status will be visible in your participant workspace.
            </p>
          </div>
          <RegistrationButton eventId={event.id} />
        </Card>
      </div>
    </div>
  );
}
