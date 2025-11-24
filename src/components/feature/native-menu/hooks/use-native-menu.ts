import { Menu, MenuOptions } from "@tauri-apps/api/menu";
import { useEffect, useRef } from "react";

export const useNativeMenu = ({ items }: { items: MenuOptions["items"] }) => {
  const menuRef = useRef<Menu | null>(null);
  const isCreatingRef = useRef(false);

  const openNativeMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If menu is being created, wait for it
    if (isCreatingRef.current) {
      // Wait a bit for menu creation to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // If menu still doesn't exist, create it now
    if (!menuRef.current) {
      try {
        menuRef.current = await Menu.new({ items });
      } catch (error) {
        console.error("Failed to create menu:", error);
        return;
      }
    }

    await menuRef.current.popup();
  };

  useEffect(() => {
    let mounted = true;
    isCreatingRef.current = true;

    const createMenu = async () => {
      try {
        const newMenu = await Menu.new({ items });
        if (mounted) {
          menuRef.current = newMenu;
        }
      } catch (error) {
        console.error("Failed to create menu:", error);
      } finally {
        isCreatingRef.current = false;
      }
    };

    createMenu();

    return () => {
      mounted = false;
    };
  }, [items]);

  return { openNativeMenu };
};
