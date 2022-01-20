import { ActionPanel, List, OpenInBrowserAction, showToast, ToastStyle, getPreferenceValues } from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";
import { format } from "date-fns";

type Infusion = {
  uid: string;
  date: string;
  type: string;
  sites?: string;
  cause?: string;
};

interface Preferences {
  API_KEY: string;
}

export default function Default() {
  const [state, setState] = useState<{ infusions: Infusion[] }>({ infusions: [] });

  useEffect(() => {
    async function fetch() {
      const infusions = await fetchInfusions();
      setState((oldState) => ({
        ...oldState,
        infusions: infusions,
      }));
    }
    fetch();
  }, []);

  return (
    <List isLoading={state.infusions.length === 0} searchBarPlaceholder="Filter infusions by type...">
      {state.infusions.map((infusion) => (
        <InfusionListItem key={infusion.uid} infusion={infusion} />
      ))}
    </List>
  );
}

function InfusionListItem(props: { infusion: Infusion }) {
  const infusion = props.infusion;

  const iconType = () => {
    switch (infusion.type) {
      case "PROPHY":
        return "🔵";
      case "PREVENTATIVE":
        return "🟢";
      default:
        return "🔴";
    }
  };

  // Fix for timezone issues when submitting on the first day of the month
  const dt = new Date(infusion.date);
  const dateOnly = new Date(dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000);

  return (
    <List.Item
      id={infusion.uid}
      title={infusion.type}
      subtitle={`${infusion.sites} ${infusion.cause && `— ${infusion.cause}`}`}
      icon={iconType()}
      accessoryTitle={format(dateOnly, "yyyy-MM-dd")}
      actions={
        <ActionPanel>
          <OpenInBrowserAction url="https://hemolog.com/home" />
        </ActionPanel>
      }
    />
  );
}

async function fetchInfusions(): Promise<Infusion[]> {
  const preferences: Preferences = getPreferenceValues();
  const { API_KEY } = preferences;
  try {
    const response = await fetch(`https://hemolog.com/api/recent-infusions?apikey=${API_KEY}`);
    const json = await response.json();
    return json as Infusion[];
  } catch (error) {
    console.error(error);
    showToast(ToastStyle.Failure, "Could not load infusions");
    return Promise.resolve([]);
  }
}
