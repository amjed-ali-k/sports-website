import {
  Anvil,
  Award,
  Axe,
  BicepsFlexed,
  Bike,
  Binoculars,
  Bird,
  Blend,
  Bolt,
  Bomb,
  BringToFront,
  Cannabis,
  ChefHat,
  CircleGauge,
  Citrus,
  Clapperboard,
  Construction,
  Cookie,
  Crown,
  Drama,
  Drum,
  Dumbbell,
  Fan,
  FlagTriangleLeft,
  FlagTriangleRight,
  FolderKanban,
  Gauge,
  Globe,
  Guitar,
  Headphones,
  Highlighter,
  KeyboardMusic,
  LandPlot,
  MicVocal,
  Origami,
  Paintbrush2,
  PaintbrushVertical,
  Palette,
  Popcorn,
  Ratio,
  Sparkles,
  Swords,
  Tickets,
  Trophy,
  VenetianMask,
  Volleyball,
} from "lucide-react";

export const iconsList = [
  {
    name: "anvil",
    icon: Anvil,
  },
  {
    name: "axe",
    icon: Axe,
  },
  {
    name: "bolt",
    icon: Bolt,
  },
  {
    name: "swords",
    icon: Swords,
  },
  {
    name: "award",
    icon: Award,
  },
  {
    name: "circle-gauge",
    icon: CircleGauge,
  },
  {
    name: "dumbbell",
    icon: Dumbbell,
  },
  {
    name: "gauge",
    icon: Gauge,
  },
  {
    name: "land-plot",
    icon: LandPlot,
  },
  {
    name: "volleyball",
    icon: Volleyball,
  },
  {
    name: "trophy",
    icon: Trophy,
  },
  {
    name: "tickets",
    icon: Tickets,
  },
  {
    name: "folder-kanban",
    icon: FolderKanban,
  },
  {
    name: "venetian-mask",
    icon: VenetianMask,
  },
  {
    name: "bird",
    icon: Bird,
  },
  {
    name: "paintbrush-vertical",
    icon: PaintbrushVertical,
  },
  {
    name: "ratio",
    icon: Ratio,
  },
  {
    name: "binoculars",
    icon: Binoculars,
  },
  {
    name: "biceps-flexed",
    icon: BicepsFlexed,
  },
  {
    name: "bike",
    icon: Bike,
  },
  {
    name: "blend",
    icon: Blend,
  },
  {
    name: "bomb",
    icon: Bomb,
  },
  {
    name: "bring-to-front",
    icon: BringToFront,
  },
  {
    name: "cannabis",
    icon: Cannabis,
  },
  {
    name: "chef-hat",
    icon: ChefHat,
  },
  {
    name: "citrus",
    icon: Citrus,
  },
  {
    name: "construction",
    icon: Construction,
  },
  {
    name: "cookie",
    icon: Cookie,
  },
  {
    name: "crown",
    icon: Crown,
  },
  {
    name: "fan",
    icon: Fan,
  },
  {
    name: "flag-triangle-right",
    icon: FlagTriangleRight,
  },
  {
    name: "flag-triangle-left",
    icon: FlagTriangleLeft,
  },
  {
    name: "globe",
    icon: Globe,
  },
  {
    name: "guitar",
    icon: Guitar,
  },
  {
    name: "headphones",
    icon: Headphones,
  },
  {
    name: "drum",
    icon: Drum,
  },
  {
    name: "drama",
    icon: Drama,
  },
  {
    name: "clapperboard",
    icon: Clapperboard,
  },
  {
    name: "keyboard-music",
    icon: KeyboardMusic,
  },
  {
    name: "mic-vocal",
    icon: MicVocal,
  },
  {
    name: "popcorn",
    icon: Popcorn,
  },
  {
    name: "sparkles",
    icon: Sparkles,
  },
  {
    name: "palette",
    icon: Palette,
  },
  {
    name: "paintbrush-vertical",
    icon: PaintbrushVertical,
  },
  {
    name: "highlighter",
    icon: Highlighter,
  },
  {
    name: "origami",
    icon: Origami,
  },
  {
    name: "paintbrush2",
    icon: Paintbrush2,
  },
] as const;

const getIcon = (name?: string | null) =>
  iconsList.find((e) => e.name === name)?.icon ?? Origami;

export const IconFromName = ({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) => {
  const Icon = getIcon(name);

  return <Icon className={className} />;
};
