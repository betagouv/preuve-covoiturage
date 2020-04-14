-- insert identities

INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (1, '5bb842c0-1f88-475e-b7e2-202f837ddbd7', '+33612345670', 'Joana', 'joana@example.com' , true);
INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (2, 'ae6f1792-bb51-4673-b50f-f5ab00dde54a', '+33612345671', 'Bob', 'bob@example.com' , true);
INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (3, '5afe864a-9b3f-4db1-8bb5-0d797f188173', '+33612345672', 'Marie', 'marie@example.com' , true);
INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (4, 'a7da590d-6274-4c54-8ff3-5782afbbd265', '+33612345673', 'Dylan', 'dylan@example.com' , true);
INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (5, 'acf1bffd-a8b3-4e38-a9fd-0389fcd0f2cd', '+33612345674', 'Julie', 'julie@example.com' , true);
INSERT INTO carpool.identities (_id, uuid, phone, firstname, email, over_18)
  VALUES (6, '00a96371-4776-4ec7-abff-b5db044db48d', '+33612345675', 'Richard', 'richard@example.com' , true);

INSERT INTO carpool.identities (_id, uuid, phone_trunc, operator_user_id, over_18)
  VALUES (7 , '1d645432-7c52-4583-84f3-4a8c6a9da88d', '+336123456', '1', true);
INSERT INTO carpool.identities (_id, uuid, phone_trunc, operator_user_id, over_18)
  VALUES (8 , '05364dc2-e514-4671-b0d5-3051eefadca6', '+336123456', '2', true);
INSERT INTO carpool.identities (_id, uuid, phone_trunc, operator_user_id, over_18)
  VALUES (9 , '7d72bd7a-c236-4615-80b5-bf546622f860', '+336123456', '3', true);
INSERT INTO carpool.identities (_id, uuid, phone_trunc, operator_user_id, over_18)
  VALUES (10 , '7a305591-c555-4c67-91d4-dbc0a99522c5', '+336123456', '4', true);
