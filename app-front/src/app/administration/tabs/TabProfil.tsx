import SelectOperator from "@/components/common/SelectOperator";
import SelectTerritory from "@/components/common/SelectTerritory";
import { Config } from "@/config";
import { labelRole } from "@/helpers/auth";
import { useAuth } from "@/providers/AuthProvider";
import { fr } from "@codegouvfr/react-dsfr";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { useEffect, useState } from "react";

export default function TabProfil() {
  const { user, onChangeTerritory, onChangeOperator } = useAuth();
  const toggleDefault = () => {
    return user?.role === "registry.admin" &&
      (user?.territory_id !== null || user?.operator_id !== null)
      ? true
      : false;
  };
  const [toggleValue, setToggleValue] = useState(toggleDefault());
  const [radioValue, setRadioValue] = useState<"operator" | "territory">(
    "territory",
  );
  useEffect(() => {
    if (toggleValue === false) {
      onChangeTerritory();
    }
  }, [toggleValue]);

  return (
    <>
      {user && (
        <>
          <h3 className={fr.cx("fr-callout__title")}>Mon profil</h3>
          <p>
            <b>Mail:</b> {user.email}
          </p>
          <p>
            <b>Rôle:</b> {labelRole(user.role)}
          </p>
          <p>
            <a
              href={`${Config.get<string>("auth.pc_uri")}/personal-information`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Modifier mes informations sur ProConnect (s'ouvre dans un nouvel onglet)"
            >
              Modifier mes informations sur ProConnect
            </a>
          </p>
          {user.role === "registry.admin" && (
            <>
              <ToggleSwitch
                label="S'identifier en tant qu'opérateur ou territoire"
                checked={toggleValue}
                onChange={() => {
                  setToggleValue(!toggleValue);
                }}
              />
              {toggleValue && (
                <>
                  <RadioButtons
                    legend="S'identifier en tant que :"
                    name="radio"
                    options={[
                      {
                        label: "Territoire",
                        nativeInputProps: {
                          checked: radioValue === "territory",
                          onChange: () => setRadioValue("territory"),
                        },
                      },
                      {
                        label: "opérateur",
                        nativeInputProps: {
                          checked: radioValue === "operator",
                          onChange: () => setRadioValue("operator"),
                        },
                      },
                    ]}
                    orientation="horizontal"
                  />
                  {radioValue === "territory" && (
                    <SelectTerritory
                      defaultValue={user?.territory_id}
                      onChange={onChangeTerritory}
                    />
                  )}
                  {radioValue === "operator" && (
                    <SelectOperator
                      defaultValue={user?.operator_id}
                      onChange={onChangeOperator}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
