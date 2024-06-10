export function dateCast(iso = false): (data: string | number | Date) => Date {
  return (data: string | number | Date): Date => {
    if (
      !data ||
      (iso &&
        typeof iso !== "string" &&
        !/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i
          .it(
            data.toString(),
          ))
    ) {
      throw new Error("Invalid Date format");
    }

    const d: Date = new Date(data);
    if (d.toString() === "Invalid Date") {
      throw new Error("Invalid Date");
    }

    return d;
  };
}
