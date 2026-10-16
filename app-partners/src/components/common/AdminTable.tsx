import Table, { type TableProps } from "@codegouvfr/react-dsfr/Table";

export default function AdminTable(props: Omit<TableProps, "className" | "colorVariant">) {
  return <Table {...props} className="admin-table" colorVariant="blue-ecume" />;
}
