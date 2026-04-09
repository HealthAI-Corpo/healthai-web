import type { Meta, StoryObj } from "@storybook/react";
import { Badge, PipelineStatusBadge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "Default", variant: "default" } };
export const Success: Story = { args: { children: "Succès", variant: "success" } };
export const Warning: Story = { args: { children: "Attention", variant: "warning" } };
export const Destructive: Story = { args: { children: "Erreur", variant: "destructive" } };
export const Outline: Story = { args: { children: "CSV", variant: "outline" } };
export const Running: Story = { args: { children: "En cours", variant: "running" } };

export const AllPipelineStatuses: Story = {
  render: () => (
    <div className="flex gap-3">
      <PipelineStatusBadge status="idle" />
      <PipelineStatusBadge status="running" />
      <PipelineStatusBadge status="success" />
      <PipelineStatusBadge status="error" />
    </div>
  ),
};
