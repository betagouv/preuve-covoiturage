-- insert operators

INSERT INTO operator.operators (_id, uuid, name, legal_name, siret, company, address, bank, contacts)
  VALUES (1, 'dccac265-db95-4db3-96c5-40ed3755fd83', 'Maxicovoit', 'Maxicovoit SAS', '78017154200027', '{}', '{}', '{}', '{}');
INSERT INTO operator.operators (_id, uuid, name, legal_name, siret, company, address, bank, contacts)
  VALUES (2, '7bf928a2-e5f7-4a53-8174-71d26d387152', 'Megacovoit', 'Megacovoit SCOP', '42169979400010', '{}', '{}', '{}', '{}');

-- insert applications

INSERT INTO application.applications (_id, uuid, name, owner_id, owner_service, permissions)
  VALUES ( 1, '1efacd36-a85b-47b2-99df-cabbf74202b3', 'Maxi Application', 1, 'operator', '{journey.create,certificate.create,certificate.download}');
INSERT INTO application.applications (_id, uuid, name, owner_id, owner_service, permissions)
  VALUES ( 2, '71c3c3d8-208f-455e-9c08-6ea2d48abf69', 'Mega Application', 2, 'operator', '{journey.create,certificate.create,certificate.download}');
