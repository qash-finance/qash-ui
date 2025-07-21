//p2id, p2idr, gift
export enum NoteType {
  P2ID = "p2id",
  P2IDR = "p2idr",
  GIFT = "gift",
}

export interface AssetDto {
  faucetId: string;
  amount: string;
}

export interface SendTransactionDto {
  recipient: string;
  assets: AssetDto[];
  private: boolean;
  recallable: boolean;
  recallableTime?: Date;
  serialNumber: number[];
  noteType: NoteType;
}

/**
 * 
 * {
    "id": 1,
    "createdAt": "2025-07-21T07:17:19.376Z",
    "updatedAt": "2025-07-21T07:17:19.376Z",
    "sender": "0x28da7b57ebe026100007351cde6b6f",
    "recipient": "0xbb308288d82b10100007046a8c17d2",
    "assets": [
        {
            "amount": "1",
            "faucetId": "0x2f3da6aa8735e7200006e8d6e06a8c"
        }
    ],
    "private": false,
    "recallable": true,
    "recallableTime": null,
    "serialNumber": [
        2,
        3,
        0,
        3
    ],
    "noteType": "p2id",
    "status": "pending"
}
 */

export interface ConsumableNote {
  id: number;
  createdAt: string;
  updatedAt: string;
  sender: string;
  recipient: string;
  assets: AssetDto[];
  private: boolean;
  recallable: boolean;
  recallableTime: string | null;
  serialNumber: number[];
  noteType: NoteType;
  status: string;
}
