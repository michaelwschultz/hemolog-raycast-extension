import { useState } from "react";
import fetch from "node-fetch";
import { format } from "date-fns";
import {
  showToast,
  ToastStyle,
  getPreferenceValues,
  Form,
  ActionPanel,
  SubmitFormAction,
  popToRoot,
  Detail,
  FormValues,
  OpenInBrowserAction,
} from "@raycast/api";

type Infusion = {
  date: string;
  type: string;
  sites?: string;
  cause?: string;
};

interface Preferences {
  API_KEY: string;
}

export default function LogInfusions() {
  const [isLoading, setIsLoading] = useState(false);

  const date = new Date();
  const adjustedDateForTimezone = new Date(date.valueOf() + date.getTimezoneOffset() / 60);

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <SubmitFormAction title="Log Infusion" onSubmit={(values: Infusion) => logInfusion(values, setIsLoading)} />
          <OpenInBrowserAction title="Visit Hemolog" url="https://hemolog.com/home" />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="type" title="Type of bleed" defaultValue="PROPHY">
        <Form.Dropdown.Item value="PROPHY" title="Prophy" icon="🔵" />
        <Form.Dropdown.Item value="BLEED" title="Bleed" icon="🔴" />
        <Form.Dropdown.Item value="PREVENTATIVE" title="Preventative" icon="🟢" />
      </Form.Dropdown>
      <Form.DatePicker id="date" title="Date of infusion" defaultValue={adjustedDateForTimezone} />
      <Form.TextField id="sites" title="Affected areas" placeholder="Left ankle, right knee" />
      <Form.TextField id="cause" title="Cause" placeholder="Ran into a door 🤦" />
    </Form>
  );
}

async function logInfusion(values: FormValues, setIsLoading: (isLoading: boolean) => void) {
  const preferences: Preferences = getPreferenceValues();
  const { API_KEY } = preferences;
  setIsLoading(true);

  if (!values.date || !values.type) {
    showToast(ToastStyle.Failure, "Bleed type and date are required");
    return;
  }

  const adjustedDateForTimezone = new Date(values.date.valueOf() + values.date.getTimezoneOffset() / 60);

  try {
    const body = {
      ...values,
      date: format(adjustedDateForTimezone, "yyyy-MM-dd"),
    };
    await fetch(`https://hemolog.com/api/log-infusion?apikey=${API_KEY}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    showToast(ToastStyle.Success, "Infusion logged!");
    setIsLoading(false);
    popToRoot();
    return <Detail markdown="See you soon 👋" />;
  } catch (error) {
    setIsLoading(false);
    console.error(error);
    showToast(ToastStyle.Failure, "Could not submit infusion");
    return Promise.resolve([]);
  }
}
