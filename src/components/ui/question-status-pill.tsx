"use client";

import { useLearningReady } from "@/components/learning-account-provider";
import { LearningStatusBadge } from "@/components/ui/semantic-badges";
import { useProgressStore } from "@/stores/use-progress-store";

export function QuestionStatusPill({
  questionId,
  showUnseen = false,
  className = "",
}: {
  questionId: string;
  showUnseen?: boolean;
  className?: string;
}) {
  const learningReady = useLearningReady();
  const hasHydrated = useProgressStore((state) => state.hasHydrated);
  const status = useProgressStore(
    (state) => state.progress[questionId]?.status ?? "unseen",
  );

  if (!hasHydrated || !learningReady) return null;
  if (status === "unseen" && !showUnseen) return null;

  return <LearningStatusBadge status={status} className={className} />;
}
