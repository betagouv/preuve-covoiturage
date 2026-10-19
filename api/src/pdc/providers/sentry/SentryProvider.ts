import { ConfigInterfaceResolver, provider, ProviderInterface } from "@/ilos/common/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { get } from "@/lib/object/index.ts";
import { Sentry } from "./Sentry.ts";

const log = taggedLogger("[sentry]");

@provider()
export class SentryProvider implements ProviderInterface {
  constructor(protected config: ConfigInterfaceResolver) {}

  boot(): void {
    const dsn = this.config.get("sentry.dsn", "");
    const environment = this.config.get("sentry.environment", "");
    const release = this.config.get("sentry.version", "");

    if (dsn !== "" && environment !== "" && release !== "") {
      Sentry.init({
        dsn,
        release: `pdc-api@${release}`,
        environment,
        beforeSend(event, hint) {
          if (!("transaction" in event)) return event;

          // add method name to event subtitle
          if (event.transaction === "POST|/rpc") {
            const data = JSON.parse(get(event, "request.data", "[]"));
            if (Array.isArray(data)) {
              event.transaction = `POST|/rpc ${get(data[0], "method", "")}`
                .trim();
            }
          }

          // filter out 401 errors on RPC route only, keep on REST routes
          if (
            "originalException" in hint &&
            event.transaction.indexOf("/rpc") > -1 &&
            hint.originalException.toString().indexOf("Unauthorized") > -1
          ) {
            return null;
          }

          log.info("event", {
            event_id: event.event_id,
            transaction: event.transaction,
            error: errorCode(hint.originalException),
          });

          return event;
        },
      });
    }
  }

  getClient() {
    return Sentry;
  }
}
