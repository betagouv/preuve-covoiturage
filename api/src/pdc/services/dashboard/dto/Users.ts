import { Infer, object, optional } from "@/lib/superstruct/index.ts";
import { Email, Id, Role } from "@/pdc/providers/superstruct/shared/index.ts";

export const Users = object({
  id: optional(Id),
  territory_id: optional(Id),
  operator_id: optional(Id),
  page: optional(Id),
  limit: optional(Id),
});

export const CreateUser = object({
  email: Email,
  role: Role,
  operator_id: Id,
  territory_id: Id,
});

export const DeleteUser = object({
  id: Id,
});

export const UpdateUser = object({
  id: Id,
  email: Email,
  role: Role,
  operator_id: Id,
  territory_id: Id,
});

export type Users = Infer<typeof Users>;
export type DeleteUser = Infer<typeof DeleteUser>;
export type CreateUser = Infer<typeof CreateUser>;
export type UpdateUser = Infer<typeof UpdateUser>;
