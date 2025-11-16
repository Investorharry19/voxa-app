export interface VoxaMessage {
  ownerUsername: string;
  type: string;
  messageText?: string;
  audioUrl?: string;
  isOpened?: boolean;
  publicId?: string;
  isStarred?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: string;
}
