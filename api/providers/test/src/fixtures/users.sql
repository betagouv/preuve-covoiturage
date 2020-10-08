-- insert users

INSERT INTO auth.users (_id, territory_id, operator_id, email, firstname, lastname, phone, password, status, role) VALUES
  (1, NULL, NULL, 'reg.admin@example.com', 'Registry', 'Admin', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'registry.admin'),
  (2, NULL, NULL, 'reg.user@example.com', 'Registry', 'User', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'registry.user'),
  (3, 1, NULL, 'maxicovoit.admin@example.com', 'Maxicovoit', 'Admin', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'operator.admin'),
  (4, 1, NULL, 'maxicovoit.user@example.com', 'Maxicovoit', 'User', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'operator.user'),
  (5, 2, NULL, 'megacovoit.admin@example.com', 'Megacovoit', 'Admin', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'operator.admin'),
  (6, 2, NULL, 'megacovoit.user@example.com', 'Megacovoit', 'User', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'operator.user'),
  (7, NULL, 1, 'atlantis.admin@example.com', 'Atlantis', 'Admin', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'territory.admin'),
  (8, NULL, 1, 'atlantis.user@example.com', 'Atlantis', 'User', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'territory.user'),
  (9, NULL, 2, 'olympus.admin@example.com', 'Olympus', 'Admin', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'territory.admin'),
  (10, NULL, 2, 'olympus.user@example.com', 'Olympus', 'User', '+33612345678', '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO', 'active', 'territory.user');
