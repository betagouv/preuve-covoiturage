import { Request } from "dep:express";

export const castOperatorIdActionParam = async (req: Request) => {
  const { query } = req;
  const q = {
    ...query,
  };
  if ("operator_id" in q) {
    q.operator_id = parseInt(q.operator_id);
  }
  return q;
},