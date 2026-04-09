import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, KpiCardSkeleton, TableSkeleton, ChartSkeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { className: "h-4 w-40" },
};

export const KpiCard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[500px]">
      <KpiCardSkeleton />
      <KpiCardSkeleton />
    </div>
  ),
};

export const Table: Story = {
  render: () => (
    <div className="w-[600px]">
      <TableSkeleton rows={4} />
    </div>
  ),
};

export const Chart: Story = {
  render: () => (
    <div className="w-[600px]">
      <ChartSkeleton height={260} />
    </div>
  ),
};
