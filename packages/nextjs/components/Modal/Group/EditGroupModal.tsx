"use client";
import React, { useEffect, useMemo, useState } from "react";
import { EditGroupModalProps, MODAL_IDS } from "@/types/modal";
import { ModalProp, useModal } from "@/contexts/ModalManagerProvider";
import BaseModal from "../BaseModal";
import { Table, CellContent } from "@/components/Common/Table";
import { ActionButton } from "@/components/Common/ActionButton";
import { useForm } from "react-hook-form";
import { useDeleteGroup, useUpdateGroup } from "@/services/api/group-payment";
import { toast } from "react-hot-toast";

type Member = { address: string; name: string };
const headers = ["No", "Remember name", "Address"];

export function EditGroupModal({ isOpen, onClose, zIndex, group }: ModalProp<EditGroupModalProps>) {
  const { openModal } = useModal();
  const { register, setValue, getValues } = useForm<{ name: string }>();
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (group) {
      setMembers(
        group.members.map(member => ({
          address: member.address,
          name: member.name,
        })) || [],
      );

      setValue("name", group.name || "");
    }
  }, [group]);

  const tableData = members.map((member, index) => ({
    No: <span className="text-white font-medium">{(index + 1).toString()}</span>,
    "Remember name": (
      <input
        type="text"
        placeholder="Enter name"
        className="text-white text-[16px] tracking-[-0.32px] leading-none w-full outline-none text-center"
        value={member.name}
        onChange={e => setMembers(prev => prev.map((m, i) => (i === index ? { ...m, name: e.target.value } : m)))}
      />
    ),
    Address: (
      <input
        type="text"
        className="text-white text-[16px] tracking-[-0.32px] leading-none w-full outline-none text-center"
        placeholder="Enter address"
        value={member.address}
        onChange={e =>
          setMembers(prev => prev.map((m, i) => (i === index ? { ...m, address: e.target.value.trim() } : m)))
        }
      />
    ),
  }));

  const actionRenderer = (_row: Record<string, CellContent>, index: number) => (
    <ActionButton text="Remove" type="deny" onClick={() => setMembers(prev => prev.filter((_, i) => i !== index))} />
  );

  const handleSave = async () => {
    try {
      const { Address } = await import("@demox-labs/miden-sdk");

      if (!group) return;

      if (members.length === 0) {
        toast.error("Please add at least one member");
        return;
      }

      // Check for empty names or addresses
      const emptyMembers = members.filter(m => !m.name.trim() || !m.address.trim());
      if (emptyMembers.length > 0) {
        toast.error("Please fill in both name and address for all members");
        return;
      }

      // Check for duplicate names
      const trimmedNames = members.map(m => m.name.trim().toLowerCase());
      const duplicateNames = trimmedNames.filter((name, index) => trimmedNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        toast.error("Duplicate names are not allowed");
        return;
      }

      // Check for duplicate addresses
      const trimmedAddresses = members.map(m => m.address.trim());
      const duplicateAddresses = trimmedAddresses.filter(
        (address, index) => trimmedAddresses.indexOf(address) !== index,
      );
      if (duplicateAddresses.length > 0) {
        toast.error("Duplicate addresses are not allowed");
        return;
      }

      members.forEach((member, index) => {
        try {
          Address.fromBech32(member.address);
        } catch (error) {
          toast.error(`Invalid address for member ${index + 1}`);
          return;
        }
      });

      const name = getValues("name") ?? group.name;
      // Persist addresses only for the group update
      const updatedMembers = members.map(m => ({ address: m.address.trim(), name: m.name.trim() }));

      await updateGroup.mutateAsync({ groupId: group.id, data: { name, members: updatedMembers } });
      onClose?.();
      toast.success("Group updated successfully");
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Edit Group" icon="/sidebar/group-payment.gif" zIndex={zIndex}>
      <div className="flex flex-col gap-1.5 bg-[#1E1E1E] rounded-b-2xl w-[600px] p-3">
        {/* Title */}
        <div className="flex items-center gap-2 py-2">
          <input
            type="text"
            className="text-white text-[32px] tracking-[-0.64px] leading-none w-full outline-none"
            {...register("name", { required: true })}
            defaultValue={group.name}
          />
        </div>
        <div className="flex flex-row justify-between items-center">
          <div className="text-[15px] tracking-[-0.45px] text-neutral-600 ">{members.length} member(s)</div>
          <ActionButton
            text="Add new"
            onClick={() => setMembers(prev => [...prev, { address: "", name: "" }])}
            className="rounded-full"
          />
        </div>

        {/* Table */}
        <Table headers={headers} data={tableData} actionColumn={true} actionRenderer={actionRenderer} />

        {/* Footer actions */}
        <div className=" rounded-b-xl flex gap-2 w-full h-10">
          <ActionButton
            text="Delete Group"
            type="deny"
            onClick={() =>
              openModal(MODAL_IDS.DELETE_GROUP, {
                groupName: group.name,
                onDelete: async () => {
                  await deleteGroup.mutateAsync(group.id);
                  onClose?.();
                  toast.success("Group deleted successfully");
                },
              })
            }
            className="flex-1"
          />
          <ActionButton text="Save changes" onClick={handleSave} className="flex-2" />
        </div>
      </div>
    </BaseModal>
  );
}

export default EditGroupModal;
