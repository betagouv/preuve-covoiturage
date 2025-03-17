"use client";
import SelectTerritory from "@/components/common/SelectTerritory";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useState } from "react";
import { getApiUrl } from "../../../helpers/api";

interface ParamsInterfaceV3 {
  tz: string;
  start_at: Date;
  end_at: Date;
  recipients?: string[];
  operator_id?: number[];
  geo_selector?: TerritorySelectorsInterface;
  territory_id?: number[];
}

enum TerritoryCodeEnum {
  Arr = "arr",
  City = "com",
  CityGroup = "epci",
  Mobility = "aom",
  Region = "reg",
  District = "dep",
  Network = "reseau",
  Country = "country",
}

interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Arr]?: string[];
  [TerritoryCodeEnum.City]?: string[];
  [TerritoryCodeEnum.Mobility]?: string[];
  [TerritoryCodeEnum.District]?: string[];
  [TerritoryCodeEnum.CityGroup]?: string[];
  [TerritoryCodeEnum.Region]?: string[];
  [TerritoryCodeEnum.Country]?: string[];
}

enum ExportStatus {
  PENDING = "pending",
  RUNNING = "running",
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  NOTIFY = "notify",
  SUCCESS = "success",
  FAILURE = "failure",
}

enum ExportTarget {
  OPENDATA = "opendata",
  OPERATOR = "operator",
  TERRITORY = "territory",
}

type ResultInterfaceV3 = {
  uuid: string;
  target: ExportTarget;
  status: ExportStatus;
  start_at: Date;
  end_at: Date;
};

export default function TabExport() {
  const { user, onChangeTerritory } = useAuth();
  const territoryId = user?.territory_id ?? 1;
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs().subtract(5, "days"));
  const export_endpoint = getApiUrl("v3", `exports`);

  // Call related states
  const [response, setResponse] = useState<ResultInterfaceV3 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    const body: ParamsInterfaceV3 = {
      tz: "Europe/Paris",
      start_at: startDate.toDate(),
      end_at: endDate.toDate(),
    };

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(export_endpoint, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error: string = await res.text();
        setError(error);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result: ResultInterfaceV3 = await res.json();
        setResponse(result);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        {user?.role === "registry.admin" && (
          <SelectTerritory
            defaultValue={territoryId}
            onChange={onChangeTerritory}
          />
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <DatePicker
            sx={{
              maxWidth: "200px",
            }}
            label="Début"
            value={startDate}
            onChange={(v) => setStartDate(v!)}
            minDate={dayjs().subtract(2, "years")}
            maxDate={endDate}
          />

          <DatePicker
            sx={{
              maxWidth: "200px",
            }}
            label="Fin"
            value={endDate}
            onChange={(v) => setEndDate(v!)}
            minDate={startDate}
            maxDate={dayjs().subtract(5, "days")}
          />
        </div>

        <div>
          <Button
            disabled={loading}
            style={{
              marginTop: fr.spacing("5v"),
            }}
            className="fr-btn"
            size="large"
            onClick={() => handleExport()}
          >
            Exporter
          </Button>
          {error && (
            <Alert
              style={{
                marginTop: fr.spacing("5v"),
              }}
              closable
              onClose={() => setError(null)}
              severity="warning"
              title="Une erreur est survenue"
              description={error}
            />
          )}
          {response && (
            <Alert
              style={{
                marginTop: fr.spacing("5v"),
              }}
              severity="success"
              title="Succès"
              description="Vous allez recevoir un email avec le lien de téléchargement prochainement"
              closable
              onClose={() => setResponse(null)}
            />
          )}
        </div>
      </LocalizationProvider>
    </>
  );
}
