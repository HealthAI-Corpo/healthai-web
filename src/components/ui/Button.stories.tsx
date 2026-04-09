import type { Meta, StoryObj } from "@storybook/react";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "outline", "ghost", "destructive"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Approuver", variant: "primary" } };
export const Secondary: Story = { args: { children: "Annuler", variant: "secondary" } };
export const Outline: Story = { args: { children: "Filtrer", variant: "outline" } };
export const Ghost: Story = { args: { children: "Modifier", variant: "ghost" } };
export const Destructive: Story = { args: { children: "Rejeter", variant: "destructive" } };

export const WithIconLeft: Story = {
  args: { children: "Exporter CSV", variant: "outline", icon: Download },
};

export const WithIconRight: Story = {
  args: { children: "Rafraîchir", variant: "outline", icon: RefreshCw, iconPosition: "right" },
};

export const Loading: Story = {
  args: { children: "Export en cours…", variant: "primary", loading: true },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm" icon={CheckCircle2}>Petit</Button>
      <Button size="md" icon={CheckCircle2}>Moyen</Button>
      <Button size="lg" icon={CheckCircle2}>Grand</Button>
    </div>
  ),
};
