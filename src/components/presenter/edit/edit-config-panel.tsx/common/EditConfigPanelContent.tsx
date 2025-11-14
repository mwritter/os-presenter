export const EditConfigPanelTabContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-1 flex-col h-full w-full p-2 mb-20">
      {children}
    </div>
  );
};
