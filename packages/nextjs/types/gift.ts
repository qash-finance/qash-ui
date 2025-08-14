import { NoteStatus, WrappedNoteType } from "./note";
import { AssetDto } from "./transaction";

export type SendGiftDto = {
  assets: AssetDto[];
  serialNumber: string[];
  secretNumber: string;
  txId: string;
};

export type Gift = {
  assets: AssetDto[];
  createdAt: string;
  noteType: WrappedNoteType;
  recallableTime: string;
  sender: string;
  serialNumber: string[];
  secretHash: string;
  status: NoteStatus;
  updatedAt: string;
};

export type GiftDashboardDto = {
  gifts: Gift[];
  totalAmount: string;
  totalOpenedGifts: string;
};
