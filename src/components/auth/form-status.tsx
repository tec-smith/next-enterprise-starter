import { CircleAlert, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function FormStatus({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (error) {
    return (
      <Alert variant="destructive">
        <CircleAlert aria-hidden />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (message) {
    return (
      <Alert role="status">
        <CircleCheck aria-hidden />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }
  return null;
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
