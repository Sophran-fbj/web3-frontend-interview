import {
  difficultyLabels,
  questionTypeLabels,
} from "@/content/question-labels";
import type { QuestionFrontmatter } from "@/content/question-schema";
import type { LearningStatus } from "@/stores/use-progress-store";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: {
    badge: "study-badge-success",
    dot: "bg-[var(--success)]",
  },
  warning: {
    badge: "study-badge-warning",
    dot: "bg-[var(--warning)]",
  },
  danger: {
    badge: "study-badge-danger",
    dot: "bg-[var(--danger)]",
  },
  info: {
    badge: "study-badge-info",
    dot: "bg-[var(--info)]",
  },
  neutral: {
    badge: "study-badge-neutral",
    dot: "bg-[var(--text-faint)]",
  },
};

const difficultyVariants: Record<
  QuestionFrontmatter["difficulty"],
  BadgeVariant
> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

export function DifficultyBadge({
  difficulty,
  className = "",
}: {
  difficulty: QuestionFrontmatter["difficulty"];
  className?: string;
}) {
  const variant = variantClasses[difficultyVariants[difficulty]];
  return (
    <span className={`study-badge ${variant.badge} ${className}`}>
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${variant.dot}`}
      />
      {difficultyLabels[difficulty]}
    </span>
  );
}

export function QuestionTypeBadge({
  questionType,
  className = "",
}: {
  questionType: QuestionFrontmatter["questionType"];
  className?: string;
}) {
  return (
    <span className={`study-badge study-badge-neutral ${className}`}>
      {questionTypeLabels[questionType]}
    </span>
  );
}

export const learningStatusLabels: Record<LearningStatus, string> = {
  unseen: "未标记",
  unclear: "不清楚",
  review: "待复习",
  mastered: "已掌握",
};

export const learningStatusVariants: Record<LearningStatus, BadgeVariant> = {
  unseen: "neutral",
  unclear: "danger",
  review: "warning",
  mastered: "success",
};

export function LearningStatusBadge({
  status,
  className = "",
}: {
  status: LearningStatus;
  className?: string;
}) {
  const variant = variantClasses[learningStatusVariants[status]];
  return (
    <span className={`study-badge ${variant.badge} ${className}`}>
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-full ${variant.dot}`}
      />
      {learningStatusLabels[status]}
    </span>
  );
}
