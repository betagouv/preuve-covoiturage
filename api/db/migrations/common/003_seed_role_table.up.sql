-- permissions are initialized empty
-- run yarn workspace @pdc/service-user ilos set-permissions
-- to set the values calculated from permissions.ts
INSERT INTO common.roles (slug, description, permissions) VALUES
('registry.admin', 'Administrateur du registre', '{}'),
('registry.user', 'Utilisateur du registre', '{}'),
('territory.admin', 'Administrateur du territoire', '{}'),
('territory.user', 'Utilisateur du territoire', '{}'),
('operator.admin', 'Administrateur de l''opérateur', '{}'),
('operator.user', 'Utilisateur de l''opérateur', '{}');
