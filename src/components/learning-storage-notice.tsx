"use client";

import {
  useAccountLearning,
  useAccountSyncState,
} from "@/components/learning-account-provider";

export function LearningStorageNotice() {
  const { owner, controller } = useAccountLearning();
  const { confirmed } = useAccountSyncState();
  return (
    <span>
      {!owner
        ? "记录保存在当前浏览器。"
        : !controller
          ? "当前账号的记录保存在此浏览器，云端同步暂不可用。"
          : confirmed
            ? "记录在本地保存并同步至此账号，同步状态可在账号页查看。"
            : "记录保存在当前账号的本地缓存，确认合并后才启用云端同步。"}
    </span>
  );
}
