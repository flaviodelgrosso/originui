import { components } from "@/registry/registry-components";
import type { RegistryTag } from "@/registry/registry-tags";
import { registryTags } from "@/registry/registry-tags";
import type { RegistryItem } from "@/registry/schema";

export const getComponents = (selectedTags: RegistryTag[] = []): RegistryItem[] => {
  return selectedTags.length
    ? components.filter((component) =>
        selectedTags.every((tag) => component.tags?.includes(tag) ?? false),
      )
    : components;
};

export const getTagCounts = (selectedTags: RegistryTag[] = []): Record<RegistryTag, number> => {
  const counts: Record<RegistryTag, number> = Object.fromEntries(
    registryTags.map((tag) => [tag, 0])
  ) as Record<RegistryTag, number>;
  
  // Get components that match current selection
  const matchingComponents = selectedTags.length
    ? components.filter((component) =>
        selectedTags.every((tag) => component.tags?.includes(tag) ?? false)
      )
    : components;

  // Count components for each tag
  matchingComponents.forEach((component) => {
    component.tags?.forEach((tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });

  return counts;
};

export const getAvailableTags = (selectedTags: RegistryTag[]): RegistryTag[] => {
  if (!selectedTags.length) return [];

  // Get all components that have all the selected tags
  const matchingComponents = components.filter((component) =>
    selectedTags.every((tag) => component.tags?.includes(tag) ?? false)
  );

  // Get all unique tags from the matching components
  const availableTags = new Set<RegistryTag>();
  matchingComponents.forEach((component) => {
    component.tags?.forEach((tag) => {
      if (!selectedTags.includes(tag)) {
        availableTags.add(tag);
      }
    });
  });

  return Array.from(availableTags);
};

export const convertRegistryPaths = (content: string): string => {
  return content
    .replace(/@\/registry\/default\/ui/g, "@/components/ui")
    .replace(/@\/registry\/default\/compositions/g, "@/components")
    .replace(/@\/registry\/default\/hooks/g, "@/hooks")
    .replace(/@\/registry\/default\/lib/g, "@/lib");
};
