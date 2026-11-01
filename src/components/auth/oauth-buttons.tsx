import { oauthSignInAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

interface OAuthButtonsProps {
  providers: { id: string; name: string }[];
  callbackUrl?: string;
}

export function OAuthButtons({ providers, callbackUrl }: OAuthButtonsProps) {
  if (providers.length === 0) return null;

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        {providers.map((provider) => (
          <form
            key={provider.id}
            action={oauthSignInAction.bind(null, provider.id, callbackUrl)}
          >
            <Button type="submit" variant="outline" className="w-full">
              Continue with {provider.name}
            </Button>
          </form>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
