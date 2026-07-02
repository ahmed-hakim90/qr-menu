"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/dashboard-api";

interface DomainManagerProps {
  subdomain: string;
  customDomain: string;
  appDomain: string;
  customDomainAllowed: boolean;
}

export function DomainManager({
  subdomain: initialSubdomain,
  customDomain: initialCustomDomain,
  appDomain,
  customDomainAllowed,
}: DomainManagerProps) {
  const router = useRouter();
  const [subdomain, setSubdomain] = useState(initialSubdomain);
  const [customDomain, setCustomDomain] = useState(initialCustomDomain);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest("/api/domain", {
        method: "PATCH",
        body: JSON.stringify({ subdomain, customDomain }),
      });
      router.refresh();
      toast.success("Domain settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Domain Settings</h1>
        <p className="text-sm text-muted-foreground">
          Use a subdomain or your own custom domain for the public menu.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Subdomain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                  pattern="[a-z0-9-]+"
                  required
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.{appDomain}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: https://{subdomain || "your-cafe"}.{appDomain}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Custom Domain</Label>
                {!customDomainAllowed && <Badge variant="secondary">Business plan only</Badge>}
              </div>
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                placeholder="menu.yourrestaurant.com"
                disabled={!customDomainAllowed}
              />
              <p className="text-xs text-muted-foreground">
                Point your domain CNAME to {appDomain}, then enter it here.
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Domain Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            DNS Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><strong>Subdomain:</strong> works automatically after saving, e.g. {subdomain}.{appDomain}</p>
          <p><strong>Custom domain:</strong> create a CNAME record pointing to {appDomain}</p>
          <p><strong>Local dev:</strong> use the normal menu URL `/menu/branch-slug` on localhost</p>
        </CardContent>
      </Card>
    </div>
  );
}
