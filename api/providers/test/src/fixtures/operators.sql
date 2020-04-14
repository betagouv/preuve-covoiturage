-- insert operators

INSERT INTO operator.operators (_id, name, legal_name, siret, company, address, bank, contacts)
  VALUES (1, 'Maxicovoit', 'Maxicovoit SAS', '78017154200027', '{}', '{}', '{}', '{}');
INSERT INTO operator.operators (_id, name, legal_name, siret, company, address, bank, contacts)
  VALUES (2, 'Megacovoit', 'Megacovoit SCOP', '42169979400010', '{}', '{}', '{}', '{}');

-- insert applications

INSERT INTO application.applications (_id, uuid, name, owner_id, owner_service, permissions)
  VALUES ( 1, '1efacd36-a85b-47b2-99df-cabbf74202b3', 'Maxi Application', 1, 'operator', '{journey.create}');
INSERT INTO application.applications (_id, uuid, name, owner_id, owner_service, permissions)
  VALUES ( 2, '71c3c3d8-208f-455e-9c08-6ea2d48abf69', 'Mega Application', 2, 'operator', '{journey.create}');
