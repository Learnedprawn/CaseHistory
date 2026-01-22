-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseHistoryId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sessionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "presentingTopics" TEXT,
    "therapistObservations" TEXT,
    "clientAffect" TEXT,
    "interventionsUsed" TEXT,
    "progressNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionLog_caseHistoryId_fkey" FOREIGN KEY ("caseHistoryId") REFERENCES "CaseHistory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SessionLog_caseHistoryId_idx" ON "SessionLog"("caseHistoryId");

-- CreateIndex
CREATE INDEX "SessionLog_clientId_idx" ON "SessionLog"("clientId");

-- CreateIndex
CREATE INDEX "SessionLog_providerId_idx" ON "SessionLog"("providerId");

-- CreateIndex
CREATE INDEX "SessionLog_sessionDate_idx" ON "SessionLog"("sessionDate");
