-- AlterTable
ALTER TABLE "Messages" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Messages_is_deleted_idx" ON "Messages"("is_deleted");
