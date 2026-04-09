import type { Meta, StoryObj } from "@storybook/react";
import { Users, TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";
import { KpiCard } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  title: "UI/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "warning", "destructive"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {
  args: {
    title: "Utilisateurs total",
    value: "4 872",
    description: "Tous plans confondus",
    icon: Users,
    variant: "default",
  },
};

export const WithTrendUp: Story = {
  args: {
    title: "Conversion Premium",
    value: "18,4 %",
    description: "Free → Premium ou Premium+",
    icon: TrendingUp,
    trend: { value: 1.2, label: "ce mois", direction: "up" },
    variant: "default",
  },
};

export const WithTrendDown: Story = {
  args: {
    title: "Taux d'erreur",
    value: "2,1 %",
    description: "Erreurs / total imports",
    icon: AlertTriangle,
    trend: { value: -0.4, label: "vs hier", direction: "down" },
    variant: "warning",
  },
};

export const Success: Story = {
  args: {
    title: "Score qualité données",
    value: "94 / 100",
    description: "Cohérence & complétude",
    icon: ShieldCheck,
    trend: { value: 2, label: "depuis hier", direction: "up" },
    variant: "success",
  },
};

export const Destructive: Story = {
  args: {
    title: "Erreurs critiques",
    value: "12",
    description: "Datasets rejetés",
    icon: AlertTriangle,
    variant: "destructive",
  },
};
