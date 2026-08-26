export const operationStatuses = [
  {
    id: "waiting",
    label: "Waiting",
  },
  {
    id: "in_progress",
    label: "In Progress",
  },
  {
    id: "ready",
    label: "Ready",
  },
  {
    id: "completed",
    label: "Completed",
  },
] as const

export type OperationStatus =
  (typeof operationStatuses)[number]["id"]
