"use client";

type SelectOption = {
  value: string;
  label: string;
};

type AutoSubmitSelectProps = {
  label: string;
  name: string;
  defaultValue?: string;
  allLabel: string;
  options: SelectOption[];
};

export function AutoSubmitSelect({
  label,
  name,
  defaultValue,
  allLabel,
  options,
}: AutoSubmitSelectProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--text-strong)]">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="min-h-11 w-full border border-[var(--line-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
