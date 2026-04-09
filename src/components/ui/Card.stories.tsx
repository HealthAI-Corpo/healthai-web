import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";
import { Badge } from "./Badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Titre de la carte</CardTitle>
        <CardDescription>Description courte du contenu</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Contenu de la carte.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Nutrition (Kaggle)</CardTitle>
        <CardDescription>Dataset importé le 21 juillet 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">8 420</p>
        <p className="text-xs text-muted-foreground">lignes valides sur 8 458</p>
      </CardContent>
      <CardFooter>
        <Badge variant="success">Qualité 99%</Badge>
      </CardFooter>
    </Card>
  ),
};

export const Highlight: Story = {
  render: () => (
    <Card className="w-80 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle>Export global</CardTitle>
        <CardDescription>Tous les datasets validés</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">19 852 lignes au total</p>
      </CardContent>
    </Card>
  ),
};
