"use client";

import React, { useEffect, useState, useMemo } from "react";
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
}: {
  reveal: boolean;
  toggleNewFolder: () => void;
  handleCreateAddressBook: (data: { name: string; address: string; category: string }) => void;
}) => {
  const [category, setCategory] = useState("");
  return (
    <div className="relative w-[150px] h-full">
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
          value={category}
          onChange={e => setCategory(e.target.value)}
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
          zIndex: 100,
          transitionDuration: `${ANIMATION_DURATION}ms`,
        }}
      >
        <CreateAddressCard onSave={data => handleCreateAddressBook({ ...data, category })} />
      </div>

      <img
        src="/address-book/funnel.svg"
        alt="funnel"
        className={`absolute z-10 left-1/2 bottom-20 translate-x-[-46%] transition-all`}
        style={{
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
        className={`absolute z-10 left-1/2 bottom-20 translate-x-[-46%] transition-all`}
        style={{
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
  console.log("🚀 ~ AddressBookContainer ~ isAnyFolderOpen:", isAnyFolderOpen);
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

  // Initialize folder states
  useEffect(() => {
    setFolderStates(new Array(folders.length).fill(false));
  }, [folders.length]);

  const toggleFolder = (folderIndex: number) => {
    const isCurrentlyOpen = folderStates[folderIndex];

    if (isCurrentlyOpen) {
      // If clicking the same folder, just close it
      setFolderStates(prev => prev.map((state, index) => (index === folderIndex ? false : false)));
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
    const { category, name } = data;

    // Prevent duplicate name in the same category
    const nameExistsInCategory = addressBooks?.some((ab: any) => ab.category === category && ab.name === name);
    if (nameExistsInCategory) {
      toast.error("Name already exists in this category");
      return;
    }

    createAddressBook(data, {
      onSuccess: () => {
        toast.success("Address book created successfully");
      },
      onError: () => {
        toast.error("Failed to create address book");
      },
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Display address cards for each open folder */}
      {folders.map((folder, folderIndex) => (
        <div
          key={folder.id}
          className="absolute left-0 w-full flex flex-wrap gap-4 justify-center items-center p-2 z-100 transition-all"
          style={{
            transitionDuration: `${ANIMATION_DURATION}ms`,
            top: "150px",
            opacity: folderStates[folderIndex] ? 1 : 0,
            transform: folderStates[folderIndex] ? "translateY(0)" : "translateY(-100%)",
          }}
        >
          {folder.addressBooks.map((addressBook: any, index: number) => (
            <AddressCard key={addressBook.id || index} addressBook={addressBook} />
          ))}
          <CreateAddressCard onSave={data => handleCreateAddressBook({ ...data, category: folder.category })} />
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
