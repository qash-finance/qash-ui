"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { AddressCard } from "./AddressCard";
import { CreateAddressCard } from "./CreateAddressCard";
import { useCreateAddressBook, useGetAddressBooks } from "@/services/api/address-book";
import { AddressBookDto } from "@/types/address-book";
import toast from "react-hot-toast";

const ANIMATION_DURATION = 500;

{
  /* <img
src="/address-book/no-address.gif"
alt="no-address"
className="w-20 h-20"
style={{
  position: "absolute",
  top: "45%",
  left: "47.5%",
  transform: "translate(-50%, -50%)",
}}
/>
<span
className="text-[#7C7C7C]"
style={{
  position: "absolute",
  top: "55%",
  left: "47.5%",
  transform: "translate(-50%, -50%)",
}}
>
No address
</span> */
}

const NewFolder = ({
  reveal,
  toggleNewFolder,
  handleCreateAddressBook,
  register,
  watch,
}: {
  reveal: boolean;
  toggleNewFolder: () => void;
  handleCreateAddressBook: (data: { name: string; address: string; category: string }) => void;
  register: any;
  watch: any;
}) => {
  const category = watch("category");

  return (
    <div className="relative w-[150px] h-full z-10">
      <div className="absolute z-20 left-1/2 bottom-10 translate-x-[-50%] cursor-pointer" onClick={toggleNewFolder}>
        <img
          src="/address-book/folder.svg"
          alt="folder"
          className=""
          style={{ width: "auto", height: "auto", minWidth: "fit-content" }}
        />
        <textarea
          className="absolute z-100 left-1/2 bottom-10 translate-x-[-30%] translate-y-[60%] text-center w-25 break-words cursor-pointer resize-none outline-none text-[#B5E0FF]"
          placeholder="New Group"
          style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
          rows={2}
          maxLength={20}
          {...register("category", {
            required: "Category is required",
            maxLength: {
              value: 20,
              message: "Category must be 20 characters or less",
            },
          })}
        />
      </div>

      <img
        src="/plus-icon.svg"
        alt="plus"
        className="absolute z-20 left-45 bottom-17 translate-x-[-50%] cursor-pointer w-8 h-8"
        onClick={toggleNewFolder}
      />

      <div
        className="transition-all"
        style={{
          position: "absolute",
          left: "55%",
          transform: reveal ? "translate(-50%, -500%)" : "translate(-50%, -200%)",
          opacity: reveal ? 1 : 0,
          zIndex: 50,
          transitionDuration: `${ANIMATION_DURATION}ms`,
          pointerEvents: reveal ? "auto" : "none",
        }}
      >
        <CreateAddressCard onSave={data => handleCreateAddressBook({ ...data, category })} />
      </div>

      <img
        src="/address-book/funnel.svg"
        alt="funnel"
        className={`absolute left-1/2 bottom-20 translate-x-[-46%] transition-all`}
        style={{
          zIndex: 10,
          pointerEvents: "none",
          transitionDuration: `${ANIMATION_DURATION}ms`,
          opacity: reveal ? 1 : 0,
          width: "auto",
          height: "auto",
          minWidth: "fit-content",
        }}
      />
    </div>
  );
};

const Folder = ({ reveal, onClick, category }: { reveal: boolean; onClick: () => void; category: string }) => {
  return (
    <div className="relative w-[150px] h-full">
      <div className="absolute z-20 left-1/2 bottom-10 translate-x-[-50%] cursor-pointer" onClick={onClick}>
        <img
          src="/address-book/folder.svg"
          alt="folder"
          className=""
          style={{ width: "auto", height: "auto", minWidth: "fit-content" }}
        />
        <div
          className="absolute z-100 left-1/2 bottom-10 translate-x-[-30%] translate-y-[60%] text-center w-25 break-words cursor-pointer text-[#B5E0FF]"
          style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
        >
          {category}
        </div>
      </div>

      <img
        src="/address-book/funnel.svg"
        alt="funnel"
        className={`absolute left-1/2 bottom-20 translate-x-[-46%] transition-all`}
        style={{
          zIndex: 10,
          pointerEvents: "none",
          transitionDuration: `${ANIMATION_DURATION}ms`,
          opacity: reveal ? 1 : 0,
          width: "auto",
          height: "auto",
          minWidth: "fit-content",
        }}
      />
    </div>
  );
};

export function AddressBookContainer() {
  const { data: addressBooks } = useGetAddressBooks();
  const { mutate: createAddressBook } = useCreateAddressBook();
  const [folderStates, setFolderStates] = useState<boolean[]>([]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const isAnyFolderOpen = folderStates.some(state => state) || newFolderOpen;

  const {
    register,
    watch,
    formState: { errors },
    setValue,
  } = useForm<{ category: string }>({
    defaultValues: {
      category: "",
    },
  });
  // Group address books by category
  const groupedAddressBooks = useMemo(() => {
    if (!addressBooks) return {};

    return addressBooks.reduce((groups: Record<string, any[]>, addressBook: any) => {
      const category = addressBook.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(addressBook);
      return groups;
    }, {});
  }, [addressBooks]);

  // Create folders based on categories
  const folders = useMemo(() => {
    return Object.keys(groupedAddressBooks)
      .sort()
      .map((category, index) => ({
        id: index + 1,
        category,
        addressBooks: groupedAddressBooks[category],
      }));
  }, [groupedAddressBooks]);

  // Initialize folderStates with correct length when folders change
  useEffect(() => {
    if (folders.length !== folderStates.length) {
      setFolderStates(new Array(folders.length).fill(false));
    }
  }, [folders.length, folderStates.length]);

  const toggleFolder = (folderIndex: number) => {
    const isCurrentlyOpen = folderStates[folderIndex];

    if (isCurrentlyOpen) {
      // If clicking the same folder, just close it
      setFolderStates(prev => prev.map((state, index) => (index === folderIndex ? false : state)));
    } else {
      // If opening a different folder, switch directly without intermediate state
      setFolderStates(prev => prev.map((state, index) => (index === folderIndex ? true : false)));
    }

    setNewFolderOpen(false); // Close new folder when opening a regular folder
  };

  const toggleNewFolder = () => {
    setNewFolderOpen(!newFolderOpen);
    setFolderStates(new Array(folders.length).fill(false)); // Close all regular folders
  };

  const handleCreateAddressBook = async (data: AddressBookDto) => {
    const name = data.name.trim();
    const category = data.category.trim();
    const address = data.address.trim();
    const token = data.token?.trim();

    if (category === "") {
      toast.error("Category is required");
      return;
    }

    // Prevent duplicate name in the same category
    const nameExistsInCategory = addressBooks?.some((ab: any) => ab.category === category && ab.name === name);
    if (nameExistsInCategory) {
      toast.error("Name already exists in this category");
      return;
    }

    // Prevent duplicate address in the same category
    const addressExistsInCategory = addressBooks?.some((ab: any) => ab.category === category && ab.address === address);
    if (addressExistsInCategory) {
      toast.error("Address already exists in this category");
      return;
    }

    createAddressBook(
      { name, category, address, token },
      {
        onSuccess: data => {
          toast.success("Address book created successfully");

          // Reset the form
          setValue("category", "");

          // Auto open the folder for the new address book
          // Check if this is a new category by looking at current folders
          const existingFolderIndex = folders.findIndex(folder => folder.category === category);
          console.log("🚀 ~ handleCreateAddressBook ~ existingFolderIndex:", existingFolderIndex);

          if (existingFolderIndex !== -1) {
            // Existing category - open that folder
            setFolderStates(prev => prev.map((state, index) => (index === existingFolderIndex ? true : false)));
          } else {
            // New category - the folders array will be updated by the memo when addressBooks changes
            // We need to wait for the next render cycle to find the new folder index
            setTimeout(() => {
              const updatedFolders = Object.keys(
                addressBooks
                  ? [...addressBooks, data].reduce((groups: Record<string, any[]>, addressBook: any) => {
                      const cat = addressBook.category;
                      if (!groups[cat]) {
                        groups[cat] = [];
                      }
                      groups[cat].push(addressBook);
                      return groups;
                    }, {})
                  : {},
              ).sort();
              const newFolderIndex = updatedFolders.findIndex(folder => folder === category);
              if (newFolderIndex !== -1) {
                setFolderStates(prev => {
                  const newStates = new Array(updatedFolders.length).fill(false);
                  newStates[newFolderIndex] = true;
                  return newStates;
                });
              }
            }, 0);
          }
          setNewFolderOpen(false);
        },
        onError: (error: any) => {
          console.log(error);
          toast.error("Failed to create address book");
        },
      },
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Display address cards for each open folder */}
      {folders.map((folder, folderIndex) => (
        <div
          key={folder.id}
          className="absolute left-0 w-full flex flex-wrap gap-4 justify-center items-center p-2 z-20 transition-all"
          style={{
            pointerEvents: folderStates[folderIndex] ? "auto" : "none",
            transitionDuration: `${ANIMATION_DURATION}ms`,
            top: "150px",
            opacity: folderStates[folderIndex] ? 1 : 0,
            transform: folderStates[folderIndex] ? "translateY(0)" : "translateY(100%)",
            visibility: folderStates[folderIndex] ? "visible" : "hidden",
          }}
        >
          {folderStates[folderIndex] && (
            <>
              {folder.addressBooks.map((addressBook: any, index: number) => (
                <AddressCard key={addressBook.id || index} addressBook={addressBook} />
              ))}
              <CreateAddressCard onSave={data => handleCreateAddressBook({ ...data, category: folder.category })} />
            </>
          )}
        </div>
      ))}

      <div className="relative w-full h-full overflow-hidden">
        <div className="absolute bottom-0 w-full flex justify-center gap-8">
          {folders.map((folder, index) => (
            <Folder
              key={folder.id}
              reveal={folderStates[index]}
              onClick={() => toggleFolder(index)}
              category={folder.category}
            />
          ))}
          <NewFolder
            reveal={newFolderOpen}
            toggleNewFolder={toggleNewFolder}
            handleCreateAddressBook={data => handleCreateAddressBook(data)}
            register={register}
            watch={watch}
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 w-full z-0 rounded-b-lg transition-all backdrop-blur-md"
        style={{
          transitionDuration: `${ANIMATION_DURATION}ms`,
          backgroundColor: "rgba(0,0,0,0.1)",
          width: "100%",
          height: isAnyFolderOpen ? "250px" : "0px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
