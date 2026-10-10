import {
  ClipboardList,
  FileText,
  Laptop,
  Luggage,
  Mail,
  Scale,
  type LucideIcon,
} from "lucide-react";
import type { ServiceIconName } from "@/content/services";

const icons: Record<ServiceIconName, LucideIcon> = {
  scale: Scale,
  file: FileText,
  luggage: Luggage,
  laptop: Laptop,
  mail: Mail,
  clipboard: ClipboardList,
};

type ServiceIconProps = {
  name: ServiceIconName;
  className?: string;
};

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const Icon = icons[name];

  return <Icon className={className} strokeWidth={1.5} aria-hidden />;
}
