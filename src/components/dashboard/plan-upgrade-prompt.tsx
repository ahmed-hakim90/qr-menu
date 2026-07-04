import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanUpgradePromptProps {
  title: string;
  description: string;
}

export function PlanUpgradePrompt({ title, description }: PlanUpgradePromptProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/billing">View Plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
