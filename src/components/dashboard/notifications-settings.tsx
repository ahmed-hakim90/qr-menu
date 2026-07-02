"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

interface NotificationsSettingsProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function NotificationsSettings({ enabled, onEnabledChange }: NotificationsSettingsProps) {
  const [supported] = useState(
    () =>
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!supported) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscribed(Boolean(subscription));
    }
    checkSubscription();
  }, [supported, enabled]);

  const subscribe = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      toast.error("Push notifications are not configured yet (missing VAPID key).");
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission was denied.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = subscription.toJSON();
      await apiRequest("/api/notifications/subscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setSubscribed(true);
      toast.success("Notifications enabled on this device");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await apiRequest("/api/notifications/subscribe", {
          method: "DELETE",
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
      toast.success("Notifications disabled on this device");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to disable notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center justify-between gap-4">
          <div>
            <Label>Enable dashboard notifications</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Get alerts for menu updates, billing, and account activity
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </label>

        {enabled && supported && (
          <div className="rounded-2xl border border-border/50 bg-muted/20 p-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {subscribed
                ? "This browser is subscribed to push notifications."
                : "Subscribe this browser to receive push notifications."}
            </p>
            <Button
              type="button"
              variant={subscribed ? "outline" : "default"}
              size="sm"
              disabled={loading}
              onClick={subscribed ? unsubscribe : subscribe}
            >
              {subscribed ? (
                <>
                  <BellOff className="h-4 w-4" />
                  Unsubscribe this device
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  Enable on this device
                </>
              )}
            </Button>
          </div>
        )}

        {enabled && !supported && (
          <p className="text-xs text-muted-foreground">
            Push notifications are not supported in this browser.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
