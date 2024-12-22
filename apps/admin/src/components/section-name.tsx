import { useSection } from "@/hooks/use-section";

export const SectionName = ({ id }: { id: number | null | undefined }) => {
  const section = useSection(id);
  return (
    <div>
      <span className="min-[430px]:hidden">{section?.slug}</span>
      <span className="hidden min-[430px]:inline">{section?.name}</span>
    </div>
  );
};
