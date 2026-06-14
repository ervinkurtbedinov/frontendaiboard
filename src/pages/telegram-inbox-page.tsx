import { useState } from "react";
import { ApproveTaskButton, RejectTaskButton, TelegramTaskCard } from "@/features/telegram";
import { EmptyState } from "@/components/ui";
import { mockTelegramTasks } from "@/lib/mocks";
import { telegramService } from "@/services";

export function TelegramInboxPage(): JSX.Element {
  const [tasks, setTasks] = useState(mockTelegramTasks);

  const approve = async (taskId: string): Promise<void> => {
    await telegramService.approveTask(taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const reject = async (taskId: string): Promise<void> => {
    await telegramService.rejectTask(taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Telegram Inbox</h2>
        <p className="text-sm text-muted-foreground">Incoming task approvals synchronized via mocked source.</p>
      </div>
      {tasks.length === 0 ? (
        <EmptyState title="Inbox is clear" description="No pending Telegram tasks right now." />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TelegramTaskCard
              key={task.id}
              task={task}
              actions={
                <>
                  <ApproveTaskButton onApprove={() => approve(task.id)} />
                  <RejectTaskButton onReject={() => reject(task.id)} />
                </>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
