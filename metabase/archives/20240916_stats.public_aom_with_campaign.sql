 WITH trip_policy_id AS (
         SELECT DISTINCT unnest(list.applied_policies) AS policy_id
           FROM trip.list
          WHERE list.applied_policies IS NOT NULL
        )
 SELECT count(1) AS count
   FROM policy.policies pp
     JOIN trip_policy_id ON trip_policy_id.policy_id = pp._id;