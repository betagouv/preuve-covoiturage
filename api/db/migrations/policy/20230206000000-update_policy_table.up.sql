ALTER TABLE policy.policies ADD COLUMN max_amount int NOT NULL DEFAULT 0;

DROP MATERIALIZED VIEW IF EXISTS STATS.WEEKLY_ACTIVE_CAMPAIGNS CASCADE;

CREATE MATERIALIZED VIEW stats.weekly_active_campaigns AS ( WITH list AS (
         SELECT pp._id,
            pp.name,
            tt.name AS territory,
            pp.start_date,
            pp.end_date,
            sum(pi.amount) FILTER (WHERE pi.status = 'validated'::policy.incentive_status_enum) AS validated,
            sum(pi.amount) FILTER (WHERE pi.status = 'draft'::policy.incentive_status_enum) AS draft,
            pp.max_amount AS enveloppe
           FROM policy.policies pp
             LEFT JOIN policy.incentives pi ON pp._id = pi.policy_id
             LEFT JOIN territory.territories tt ON pp.territory_id = tt._id
          WHERE pp.status = 'active'::policy.policy_status_enum 
          AND pp.end_date > now() 
          GROUP BY pp._id, pp.name, tt.name, pp.start_date, pp.end_date, pp.max_amount
          ORDER BY (sum(pi.amount) FILTER (WHERE pi.status = 'validated'::policy.incentive_status_enum)) DESC
        )
 SELECT list._id,
    list.territory,
    list.start_date,
    list.end_date,
    list.validated,
    list.draft,
    list.enveloppe,
    list.validated + list.draft AS total_encours,
    date_part('day'::text, now() - list.start_date) / date_part('day'::text, list.end_date - list.start_date) AS conso_jours,
    list.name
   FROM list);


-- ALTER TABLE policy.policies DROP COLUMN IF EXISTS unit;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS parent_id;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS ui_status;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS global_rules;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS rules;
ALTER TABLE policy.policies DROP COLUMN IF EXISTS slug;
