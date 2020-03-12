export interface CarpoolInterface {
  _id?: number;
  acquisition_id: number;
  operator_id: number;
  identity_id: number;
  trip_id: string;
  operator_trip_id: string;
  operator_journey_id: string;
  is_driver: boolean;
  operator_class: string;
  datetime: Date;
  duration: number;
  distance: string;
  start_position: string;
  start_insee: string;
  end_position: string;
  end_insee: string;
  seats: string;
  cost: number;
  meta: any;
  created_at: Date;
}

/**

                                               Table "carpool.carpools"
       Column        |           Type           | Collation | Nullable |                    Default
---------------------+--------------------------+-----------+----------+-----------------------------------------------
 _id                 | integer                  |           | not null | nextval('carpool.carpools__id_seq'::regclass)
 created_at          | timestamp with time zone |           |          | now()
 acquisition_id      | integer                  |           |          |
 operator_id         | integer                  |           |          |
 trip_id             | character varying        |           |          |
 operator_trip_id    | character varying        |           |          |
 is_driver           | boolean                  |           |          |
 operator_class      | character(1)             |           |          |
 datetime            | timestamp with time zone |           |          |
 duration            | integer                  |           |          |
 start_position      | geography                |           |          |
 start_insee         | character varying        |           |          |
 end_position        | geography                |           |          |
 end_insee           | character varying        |           |          |
 distance            | integer                  |           |          |
 seats               | integer                  |           |          | 1
 identity_id         | integer                  |           | not null |
 operator_journey_id | character varying        |           |          |
 cost                | integer                  |           | not null | 0
 meta                | json                     |           |          |

 */
