import { createDatabase, dropDatabase, migrate } from '@pdc/migrator';

export class Database {
    constructor(
        protected dbName: string,
    ) {}

    async create() {
        await createDatabase(this.dbName);
    }

    async migrate() {
        await migrate();
    }

    async seed() {
        /*
          - Territoires
            - territory.territories
            - territory.territory_codes
            - territory.relation
            - company.companies

          - Operateurs
            - operator.operators
            - operator.thumbnails
            - application.applications
            - company.companies
            - territory.territory_operators

          - Utilisateurs
            - auth.users
          - Politiques
            - policy.policies

          - Trajets
            - acquisition.acquisitions
            - carpool.carpools
            - carpool.identities

          - Liste des tables
            - certificates.**
            - honor.tracking
            - fraudcheck.fraudchecks
            - policy.policy_metas
            - policy.incentives
            +++ VIEWS +++ 
        */
    }

    async destroy() {
        await dropDatabase(this.dbName);
    }
}
