import { command, CommandInterface, ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { errorCode, formatTaggedLine, taggedLogger } from "@/lib/logger/tagged.ts";
import { auditLog } from "@/pdc/proxy/audit.ts";
import {
  MailTemplateNotificationInterface,
  NotificationTransporterInterfaceResolver,
} from "@/pdc/providers/notification/index.ts";
import { SessionRepository } from "@/pdc/services/auth/providers/SessionRepository.ts";
import { UsersRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/UsersRepositoryInterface.ts";
import { InactiveUserDeletionWarningNotification } from "../notifications/InactiveUserDeletionWarningNotification.ts";

const log = taggedLogger("[purge]", { maxLength: 512 });

interface Options {
  inactivity: string;
  grace: string;
  appUrl?: string;
  dryRun: boolean;
}

// Garde-fou : le transporter mail no-op silencieusement si non configuré.
// On refuse de tourner sans SMTP, sinon on marquerait/supprimerait des comptes jamais avertis.
export function assertNotificationConfigured(config: ConfigInterfaceResolver): void {
  const smtp = config.get("notification.mail.smtp", null);
  if (!smtp) {
    throw new Error(
      "[purge] notification.mail.smtp non configuré ; arrêt pour éviter de supprimer des comptes non avertis",
    );
  }
}

@command({
  signature: "dashboard:purge-inactive-users",
  description: "Avertit puis supprime les comptes back-office inactifs (RGPD)",
  options: [
    { signature: "--inactivity <inactivity>", description: "Seuil d'inactivité (interval PG)", default: "12 months" },
    { signature: "--grace <grace>", description: "Durée du préavis (interval PG)", default: "7 days" },
    { signature: "--app-url <appUrl>", description: "URL de reconnexion (défaut : APP_APP_URL)" },
    { signature: "--dry-run", description: "N'envoie rien et ne supprime rien, log seulement" },
  ],
})
export class PurgeInactiveUsersCommand implements CommandInterface {
  constructor(
    private config: ConfigInterfaceResolver,
    private usersRepository: UsersRepositoryInterfaceResolver,
    private emailer: NotificationTransporterInterfaceResolver<MailTemplateNotificationInterface>,
    private sessionRepository: SessionRepository,
  ) {}

  public async call(options: Options): Promise<string> {
    assertNotificationConfigured(this.config);
    const appUrl = options.appUrl || this.config.get("app_url");

    // Phase 1 — avertir
    const toWarn = await this.usersRepository.findUsersToWarn(options.inactivity);
    let warned = 0;
    for (const user of toWarn) {
      const fullname = `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || user.email;
      try {
        if (options.dryRun) {
          log.info("would warn", { id: user._id, dry_run: true });
        } else {
          await this.emailer.send(
            new InactiveUserDeletionWarningNotification(`${fullname} <${user.email}>`, {
              fullname,
              action_href: appUrl,
            }),
          );
          // Si markUserWarned throw ici, warned peut sous-compter (sens sûr : l'utilisateur sera réavertit, jamais supprimé à tort).
          await this.usersRepository.markUserWarned(user._id);
          warned++;
          auditLog.info("dashboard:purgeInactiveUsers", {
            outcome: "ok",
            transport: "internal",
            result: "warned",
            id: user._id,
          });
        }
      } catch (e) {
        log.error("warn failed", { id: user._id, error: errorCode(e) });
      }
    }

    // Phase 2 — supprimer
    // Suppression atomique (DELETE ... RETURNING avec les mêmes filtres) pour éviter
    // toute course entre une sélection et une suppression : un compte reconnecté pendant
    // le run n'est pas supprimé. En dry-run on se contente de lister les candidats.
    let candidates = 0;
    let deleted = 0;
    if (options.dryRun) {
      const toDelete = await this.usersRepository.findUsersToDelete(options.grace);
      candidates = toDelete.length;
      for (const user of toDelete) {
        log.info("would delete", { id: user._id, dry_run: true });
      }
    } else {
      const removed = await this.usersRepository.deleteInactiveUsers(options.grace);
      deleted = removed.length;
      candidates = removed.length;
      for (const user of removed) {
        auditLog.info("dashboard:purgeInactiveUsers", {
          outcome: "ok",
          transport: "internal",
          result: "deleted",
          id: user._id,
        });
        // Un compte inactif peut encore porter un cookie valide : on ferme ses sessions.
        try {
          await this.sessionRepository.destroyByUser(user._id);
        } catch (e) {
          log.error("session purge failed", { id: user._id, error: errorCode(e) });
        }
      }
    }

    const fields = {
      warned,
      to_warn: toWarn.length,
      deleted,
      candidates,
      dry_run: options.dryRun,
    };
    log.info("done", fields);
    return formatTaggedLine("[purge]", "done", fields);
  }
}
