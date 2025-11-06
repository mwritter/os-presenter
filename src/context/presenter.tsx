import { AddPresentationDialog } from "@/components/presenter/dialogs/library/AddPresentationDialog";
import { createContext, ReactNode, useContext, useState } from "react";

interface PresenterContextType {
    openAddPresentationDialog: () => void;
    closeAddPresentationDialog: () => void;
}

const PresenterContext = createContext<PresenterContextType | undefined>(undefined);

export const PresenterProvider = ({ children }: { children: ReactNode }) => {
    const [addPresentationDialogOpen, setAddPresentationDialogOpen] = useState(false);
    const openAddPresentationDialog = () => setAddPresentationDialogOpen(true);
    const closeAddPresentationDialog = () => setAddPresentationDialogOpen(false);

    return (
        <PresenterContext value={{ openAddPresentationDialog, closeAddPresentationDialog }}>
            {children}
            <AddPresentationDialog
                open={addPresentationDialogOpen}
                onOpenChange={setAddPresentationDialogOpen}
            />
        </PresenterContext>
    );
};

export const usePresenterContext = () => {
    const context = useContext(PresenterContext);
    if (context === undefined) {
        throw new Error("usePresenterContext must be used within a PresenterProvider");
    }
    return context;
};