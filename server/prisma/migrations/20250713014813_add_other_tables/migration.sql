/*
  Warnings:

  - A unique constraint covering the columns `[user_id,channel_id]` on the table `ChannelMembers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,channel_id]` on the table `UserChannelRead` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,other_user_id]` on the table `UserDMRead` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ChannelMembers" DROP CONSTRAINT "ChannelMembers_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "ChannelMembers" DROP CONSTRAINT "ChannelMembers_user_id_fkey";

-- DropForeignKey
ALTER TABLE "DirectMessages" DROP CONSTRAINT "DirectMessages_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "DirectMessages" DROP CONSTRAINT "DirectMessages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserChannelRead" DROP CONSTRAINT "UserChannelRead_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "UserChannelRead" DROP CONSTRAINT "UserChannelRead_last_read_message_id_fkey";

-- DropForeignKey
ALTER TABLE "UserChannelRead" DROP CONSTRAINT "UserChannelRead_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDMRead" DROP CONSTRAINT "UserDMRead_last_read_dm_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDMRead" DROP CONSTRAINT "UserDMRead_other_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDMRead" DROP CONSTRAINT "UserDMRead_user_id_fkey";

-- AlterTable
ALTER TABLE "UserChannelRead" ADD COLUMN     "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "UserDMRead" ADD COLUMN     "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMembers_user_id_channel_id_key" ON "ChannelMembers"("user_id", "channel_id");

-- CreateIndex
CREATE INDEX "DirectMessages_sender_id_idx" ON "DirectMessages"("sender_id");

-- CreateIndex
CREATE INDEX "DirectMessages_receiver_id_idx" ON "DirectMessages"("receiver_id");

-- CreateIndex
CREATE INDEX "DirectMessages_created_at_idx" ON "DirectMessages"("created_at");

-- CreateIndex
CREATE INDEX "Messages_channel_id_idx" ON "Messages"("channel_id");

-- CreateIndex
CREATE INDEX "Messages_user_id_idx" ON "Messages"("user_id");

-- CreateIndex
CREATE INDEX "Messages_created_at_idx" ON "Messages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannelRead_user_id_channel_id_key" ON "UserChannelRead"("user_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserDMRead_user_id_other_user_id_key" ON "UserDMRead"("user_id", "other_user_id");

-- AddForeignKey
ALTER TABLE "DirectMessages" ADD CONSTRAINT "DirectMessages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessages" ADD CONSTRAINT "DirectMessages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDMRead" ADD CONSTRAINT "UserDMRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDMRead" ADD CONSTRAINT "UserDMRead_other_user_id_fkey" FOREIGN KEY ("other_user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDMRead" ADD CONSTRAINT "UserDMRead_last_read_dm_id_fkey" FOREIGN KEY ("last_read_dm_id") REFERENCES "DirectMessages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembers" ADD CONSTRAINT "ChannelMembers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembers" ADD CONSTRAINT "ChannelMembers_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannelRead" ADD CONSTRAINT "UserChannelRead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannelRead" ADD CONSTRAINT "UserChannelRead_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChannelRead" ADD CONSTRAINT "UserChannelRead_last_read_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "Channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
