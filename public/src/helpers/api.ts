import { Config } from "@/config";
import { DashboardContext } from "@/context/DashboardProvider";
import { useContext } from "react";

export const GetApiUrl = (
  route: string,
  params: string[],
) => {
  const { dashboard } = useContext(DashboardContext);
  switch (dashboard.params.period) {
    case "month":
      params.push(`month=${dashboard.params.month}`);
      break;
    case "trimester":
      params.push(`trimester=${dashboard.params.trimester}`);
      break;
    case "semester":
      params.push(`semester=${dashboard.params.semester}`);
      break;
  }
  return `${Config.get<string>("next.public_api_url", "")}/${route}?${
    params.join("&")
  }`;
};
