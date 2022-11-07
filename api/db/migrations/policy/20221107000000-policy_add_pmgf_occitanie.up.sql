-- add Occitanie

INSERT INTO policy.policies (
  territory_id, start_date, end_date, name, unit, status, handler
) VALUES (
  248, '2022-10-24T00:00:00+0200', '2023-06-30T00:00:00+0200', 'Occitanie 2022/2023', 'euro', 'active', 'occitanie_2022'
);

-- add PMGF

INSERT INTO policy.policies (
  territory_id, start_date, end_date, name, unit, status, handler
) VALUES (
  36102, '2022-11-02T00:00:00+0100', '2023-12-31T00:00:00+0100', 'PMGF 2022/2023', 'euro', 'active', 'pmgf_2022'
);

-- add Lannion

INSERT INTO policy.policies (
  territory_id, start_date, end_date, name, unit, status, handler
) VALUES (
  321, '2022-10-01T00:00:00+0200', '2023-06-30T00:00:00+0200', 'Lannion 2022/2023', 'euro', 'active', 'lannion_2022'
);
