SELECT to_char(acquisitions.created_at, 'YYYY-mm-dd'::text) AS date,
  count(*) FILTER (WHERE acquisitions.status = 'pending'::acquisition.acquisition_status_enum) AS pending,
  count(*) FILTER (WHERE acquisitions.status = 'error'::acquisition.acquisition_status_enum) AS error,
  count(*) FILTER (WHERE acquisitions.status = 'ok'::acquisition.acquisition_status_enum) AS ok,
  count(*) AS total
FROM acquisition.acquisitions
WHERE acquisitions.created_at > (CURRENT_TIMESTAMP - '2 mons'::interval)
GROUP BY (to_char(acquisitions.created_at, 'YYYY-mm-dd'::text))
ORDER BY (to_char(acquisitions.created_at, 'YYYY-mm-dd'::text)) DESC;
