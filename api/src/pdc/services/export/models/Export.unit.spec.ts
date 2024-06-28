import { assert, describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { Export, ExportTarget } from "./Export.ts";

describe("Export", () => {
  function context(user: Required<ContextType>["call"]["user"]): ContextType {
    return {
      channel: { service: "test" },
      call: { user: { ...user, _id: 1 } },
    };
  }

  it("Export.setTarget() defaults to OPENDATA", () => {
    assert(Export.target(context({})), ExportTarget.OPENDATA);
    assert(Export.target(context({}), null), ExportTarget.OPENDATA);
    assert(Export.target(context({}), undefined), ExportTarget.OPENDATA);
    assert(
      Export.target({ channel: { service: "missing_user" } }),
      ExportTarget.OPENDATA,
    );
  });

  it("Export.setTarget() sets to territory when valid", () => {
    assert(Export.target(context({ territory_id: 1 })), ExportTarget.TERRITORY);
    assert(
      Export.target(context({ territory_id: null })),
      ExportTarget.OPENDATA,
    );
    assert(
      Export.target(context({ territory_id: undefined })),
      ExportTarget.OPENDATA,
    );
    assert(
      Export.target(context({ territory_id: "asdasd" })),
      ExportTarget.OPENDATA,
    );
  });

  it("Export.setTarget() sets to operator when valid", () => {
    assert(Export.target(context({ operator_id: 1 })), ExportTarget.OPERATOR);
    assert(
      Export.target(context({ operator_id: null })),
      ExportTarget.OPENDATA,
    );
    assert(
      Export.target(context({ operator_id: undefined })),
      ExportTarget.OPENDATA,
    );
    assert(
      Export.target(context({ operator_id: "asdasd" })),
      ExportTarget.OPENDATA,
    );
  });
});
