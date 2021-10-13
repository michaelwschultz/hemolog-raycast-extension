import { ActionPanel, List, OpenInBrowserAction, showToast, ToastStyle, getPreferenceValues } from "@raycast/api";
import { useState, useEffect } from "react";
import fetch from "node-fetch";

export default function InfusionList() {
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
        <InfusionListItem key={infusion.id} infusion={infusion} />
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

  return (
    <List.Item
      id={infusion.id}
      key={infusion.id}
      title={infusion.type}
      subtitle={`${infusion.sites} ${infusion.cause && `— ${infusion.cause}`}`}
      icon={iconType()}
      accessoryTitle={new Date(infusion.date).toLocaleDateString()}
      actions={
        <ActionPanel>
          <OpenInBrowserAction url={infusion.date} />
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

type Infusion = {
  id: string;
  date: string;
  type: string;
  sites?: string;
  cause?: string;
};

interface Preferences {
  API_KEY: string;
}
