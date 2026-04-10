function mapEvent(row) {
  if (!row) return null;
  return {
    eventId: row.event_id,
    organizerId: row.organizer_id,
    title: row.title,
    description: row.description,
    theme: row.theme,
    venueName: row.venue_name,
    city: row.city,
    startAt: row.start_at,
    endAt: row.end_at,
    timezone: row.timezone,
    capacity: row.capacity,
    visibility: row.visibility,
    pricingType: row.pricing_type,
    status: row.status,
    coverImageRef: row.cover_image_ref,
    scheduledPublishAt: row.scheduled_publish_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  };
}

function emptyManagedEventCounts() {
  return {
    total: 0,
    draft: 0,
    published: 0,
    full: 0,
    closed: 0,
    archived: 0,
    cancelled: 0
  };
}

function countKeyForStatus(status) {
  return {
    DRAFT: "draft",
    PUBLISHED: "published",
    FULL: "full",
    CLOSED: "closed",
    ARCHIVED: "archived",
    CANCELLED: "cancelled"
  }[status] || null;
}

const BASE_SELECT = `
  SELECT
    event_id,
    organizer_id,
    title,
    description,
    theme,
    venue_name,
    city,
    start_at,
    end_at,
    timezone,
    capacity,
    visibility,
    pricing_type,
    status,
    cover_image_ref,
    scheduled_publish_at,
    published_at,
    created_at,
    updated_at,
    deleted_at
  FROM events
`;

export function createEventRepository(pool) {
  return {
    async checkConnection() {
      await pool.query("SELECT 1");
    },

    async createDraft(event) {
      const { rows } = await pool.query(
        `
          INSERT INTO events (
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
          RETURNING
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [
          event.eventId,
          event.organizerId,
          event.title,
          event.description,
          event.theme,
          event.venueName,
          event.city,
          event.startAt,
          event.endAt,
          event.timezone,
          event.capacity,
          event.visibility,
          event.pricingType,
          event.status,
          event.coverImageRef,
          event.scheduledPublishAt,
          event.publishedAt,
          event.createdAt,
          event.updatedAt,
          event.deletedAt
        ]
      );
      return mapEvent(rows[0]);
    },

    async findById(eventId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE event_id = $1
            AND deleted_at IS NULL
          LIMIT 1
        `,
        [eventId]
      );
      return mapEvent(rows[0]);
    },

    async findPublicById(eventId) {
      const { rows } = await pool.query(
        `
          ${BASE_SELECT}
          WHERE event_id = $1
            AND deleted_at IS NULL
            AND status = 'PUBLISHED'
            AND visibility = 'PUBLIC'
          LIMIT 1
        `,
        [eventId]
      );
      return mapEvent(rows[0]);
    },

    async listDrafts({ organizerId, isAdmin, page, pageSize }) {
      const offset = (page - 1) * pageSize;
      const params = [];
      const whereClauses = ["deleted_at IS NULL", "status = 'DRAFT'"];
      if (!isAdmin) {
        params.push(organizerId);
        whereClauses.push(`organizer_id = $${params.length}`);
      }

      const whereSql = whereClauses.join(" AND ");
      const countSql = `SELECT COUNT(*)::int AS total FROM events WHERE ${whereSql}`;
      const countResult = await pool.query(countSql, params);
      const total = countResult.rows[0]?.total || 0;

      params.push(pageSize);
      params.push(offset);
      const listSql = `
        ${BASE_SELECT}
        WHERE ${whereSql}
        ORDER BY created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;
      const { rows } = await pool.query(listSql, params);
      return {
        items: rows.map(mapEvent),
        total
      };
    },

    async listManagedEvents({
      organizerId,
      isAdmin,
      page,
      pageSize,
      status,
      theme,
      fromDate,
      toDate
    }) {
      const offset = (page - 1) * pageSize;
      const params = [];
      const whereClauses = ["deleted_at IS NULL"];
      if (!isAdmin) {
        params.push(organizerId);
        whereClauses.push(`organizer_id = $${params.length}`);
      }

      if (status) {
        params.push(status);
        whereClauses.push(`status = $${params.length}`);
      }
      if (theme) {
        params.push(theme);
        whereClauses.push(`theme = $${params.length}`);
      }
      if (fromDate) {
        params.push(fromDate);
        whereClauses.push(`start_at >= $${params.length}`);
      }
      if (toDate) {
        params.push(toDate);
        whereClauses.push(`start_at <= $${params.length}`);
      }

      const summaryParams = [];
      const summaryWhereClauses = ["deleted_at IS NULL"];
      if (!isAdmin) {
        summaryParams.push(organizerId);
        summaryWhereClauses.push(`organizer_id = $${summaryParams.length}`);
      }

      const whereSql = whereClauses.join(" AND ");
      const countSql = `SELECT COUNT(*)::int AS total FROM events WHERE ${whereSql}`;
      const countResult = await pool.query(countSql, params);
      const total = countResult.rows[0]?.total || 0;

      params.push(pageSize);
      params.push(offset);
      const listSql = `
        ${BASE_SELECT}
        WHERE ${whereSql}
        ORDER BY start_at DESC, created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;
      const { rows } = await pool.query(listSql, params);

      const summaryWhereSql = summaryWhereClauses.join(" AND ");
      const summarySql = `
        SELECT status, COUNT(*)::int AS total
        FROM events
        WHERE ${summaryWhereSql}
        GROUP BY status
      `;
      const summaryResult = await pool.query(summarySql, summaryParams);
      const counts = emptyManagedEventCounts();
      for (const row of summaryResult.rows) {
        const key = countKeyForStatus(String(row.status || "").toUpperCase());
        if (key) {
          counts[key] = row.total;
          counts.total += row.total;
        }
      }

      return {
        items: rows.map(mapEvent),
        total,
        counts
      };
    },

    async listPublicEvents({
      q,
      theme,
      city,
      from,
      to,
      page,
      pageSize
    }) {
      const offset = (page - 1) * pageSize;
      const params = [];
      const whereClauses = [
        "deleted_at IS NULL",
        "status = 'PUBLISHED'",
        "visibility = 'PUBLIC'"
      ];

      if (q) {
        params.push(`%${q.toLowerCase()}%`);
        whereClauses.push(
          `(LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`
        );
      }
      if (theme) {
        params.push(theme);
        whereClauses.push(`theme = $${params.length}`);
      }
      if (city) {
        params.push(city);
        whereClauses.push(`city = $${params.length}`);
      }
      if (from) {
        params.push(from);
        whereClauses.push(`start_at >= $${params.length}`);
      }
      if (to) {
        params.push(to);
        whereClauses.push(`start_at <= $${params.length}`);
      }

      const whereSql = whereClauses.join(" AND ");
      const countSql = `SELECT COUNT(*)::int AS total FROM events WHERE ${whereSql}`;
      const countResult = await pool.query(countSql, params);
      const total = countResult.rows[0]?.total || 0;

      params.push(pageSize);
      params.push(offset);
      const listSql = `
        ${BASE_SELECT}
        WHERE ${whereSql}
        ORDER BY start_at ASC, created_at DESC
        LIMIT $${params.length - 1}
        OFFSET $${params.length}
      `;
      const { rows } = await pool.query(listSql, params);
      return {
        items: rows.map(mapEvent),
        total
      };
    },

    async updateDraft(eventId, patch, updatedAt) {
      const fields = [];
      const values = [];
      let index = 1;

      const fieldMap = {
        title: "title",
        description: "description",
        theme: "theme",
        venueName: "venue_name",
        city: "city",
        startAt: "start_at",
        endAt: "end_at",
        timezone: "timezone",
        capacity: "capacity",
        visibility: "visibility",
        pricingType: "pricing_type",
        coverImageRef: "cover_image_ref"
      };

      for (const [key, dbField] of Object.entries(fieldMap)) {
        if (Object.hasOwn(patch, key)) {
          fields.push(`${dbField} = $${index}`);
          values.push(patch[key]);
          index += 1;
        }
      }

      fields.push(`updated_at = $${index}`);
      values.push(updatedAt);
      index += 1;

      values.push(eventId);
      const sql = `
        UPDATE events
        SET ${fields.join(", ")}
        WHERE event_id = $${index}
          AND deleted_at IS NULL
        RETURNING
          event_id,
          organizer_id,
          title,
          description,
          theme,
          venue_name,
          city,
          start_at,
          end_at,
          timezone,
          capacity,
          visibility,
          pricing_type,
          status,
          cover_image_ref,
          scheduled_publish_at,
          published_at,
          created_at,
          updated_at,
          deleted_at
      `;
      const { rows } = await pool.query(sql, values);
      return mapEvent(rows[0]);
    },

    async softDeleteDraft(eventId, deletedAt) {
      const { rows } = await pool.query(
        `
          UPDATE events
          SET deleted_at = $2, updated_at = $2
          WHERE event_id = $1
            AND deleted_at IS NULL
          RETURNING
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [eventId, deletedAt]
      );
      return mapEvent(rows[0]);
    },

    async publishDraft(eventId, publishedAt, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE events
          SET status = 'PUBLISHED',
              published_at = $2,
              scheduled_publish_at = NULL,
              updated_at = $3
          WHERE event_id = $1
            AND deleted_at IS NULL
          RETURNING
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [eventId, publishedAt, updatedAt]
      );
      return mapEvent(rows[0]);
    },

    async scheduleDraft(eventId, scheduledPublishAt, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE events
          SET scheduled_publish_at = $2, updated_at = $3
          WHERE event_id = $1
            AND deleted_at IS NULL
          RETURNING
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [eventId, scheduledPublishAt, updatedAt]
      );
      return mapEvent(rows[0]);
    },

    async publishDueScheduledDrafts(nowIso, publishedAt) {
      const { rows } = await pool.query(
        `
          WITH due AS (
            SELECT event_id
            FROM events
            WHERE deleted_at IS NULL
              AND status = 'DRAFT'
              AND scheduled_publish_at IS NOT NULL
              AND scheduled_publish_at <= $1
            ORDER BY scheduled_publish_at ASC, created_at ASC
          )
          UPDATE events
          SET status = 'PUBLISHED',
              published_at = COALESCE(published_at, $2),
              scheduled_publish_at = NULL,
              updated_at = $2
          FROM due
          WHERE events.event_id = due.event_id
          RETURNING
            events.event_id,
            events.organizer_id,
            events.title,
            events.description,
            events.theme,
            events.venue_name,
            events.city,
            events.start_at,
            events.end_at,
            events.timezone,
            events.capacity,
            events.visibility,
            events.pricing_type,
            events.status,
            events.cover_image_ref,
            events.scheduled_publish_at,
            events.published_at,
            events.created_at,
            events.updated_at,
            events.deleted_at
        `,
        [nowIso, publishedAt]
      );
      return rows.map(mapEvent);
    },

    async cancelEvent(eventId, updatedAt) {
      const { rows } = await pool.query(
        `
          UPDATE events
          SET status = 'CANCELLED',
              scheduled_publish_at = NULL,
              updated_at = $2
          WHERE event_id = $1
            AND deleted_at IS NULL
          RETURNING
            event_id,
            organizer_id,
            title,
            description,
            theme,
            venue_name,
            city,
            start_at,
            end_at,
            timezone,
            capacity,
            visibility,
            pricing_type,
            status,
            cover_image_ref,
            scheduled_publish_at,
            published_at,
            created_at,
            updated_at,
            deleted_at
        `,
        [eventId, updatedAt]
      );
      return mapEvent(rows[0]);
    }
  };
}
