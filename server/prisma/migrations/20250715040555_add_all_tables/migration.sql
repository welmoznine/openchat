-- CreateTable
CREATE TABLE "DirectMessages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDMRead" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "other_user_id" TEXT NOT NULL,
    "last_read_dm_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDMRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channels" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),

    CONSTRAINT "Channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMembers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,

    CONSTRAINT "ChannelMembers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChannelRead" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "last_read_message_id" TEXT NOT NULL,
    "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChannelRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "mentioned_user_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectMessages_sender_id_idx" ON "DirectMessages"("sender_id");

-- CreateIndex
CREATE INDEX "DirectMessages_receiver_id_idx" ON "DirectMessages"("receiver_id");

-- CreateIndex
CREATE INDEX "DirectMessages_created_at_idx" ON "DirectMessages"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "UserDMRead_user_id_other_user_id_key" ON "UserDMRead"("user_id", "other_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMembers_user_id_channel_id_key" ON "ChannelMembers"("user_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannelRead_user_id_channel_id_key" ON "UserChannelRead"("user_id", "channel_id");

-- CreateIndex
CREATE INDEX "Messages_channel_id_idx" ON "Messages"("channel_id");

-- CreateIndex
CREATE INDEX "Messages_user_id_idx" ON "Messages"("user_id");

-- CreateIndex
CREATE INDEX "Messages_created_at_idx" ON "Messages"("created_at");

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

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_mentioned_user_id_fkey" FOREIGN KEY ("mentioned_user_id") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
