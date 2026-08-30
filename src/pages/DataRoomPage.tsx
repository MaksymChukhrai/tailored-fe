import type { JSX } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/layout/AppHeader";
import { BrowserView } from "@/components/data-room/BrowserView";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataRoom, useDataRoomContents } from "@/api/data-rooms";

export function DataRoomPage(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: dataRoom,
    isLoading: isRoomLoading,
    isError: isRoomError,
  } = useDataRoom(roomId);
  const contents = useDataRoomContents(roomId);

  if (!roomId || isRoomError) {
    return <Navigate to="/" replace />;
  }

  const handleUploaded = (): void => {
    void queryClient.invalidateQueries({
      queryKey: ["folders"],
      refetchType: "active",
    });
    void queryClient.invalidateQueries({
      queryKey: ["data-rooms"],
      refetchType: "active",
    });
  };

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <BrowserView
        dataRoomId={roomId}
        titleSlot={
          isRoomLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {dataRoom?.name}
            </h1>
          )
        }
        folders={contents.data?.subfolders ?? []}
        files={contents.data?.files ?? []}
        isLoading={contents.isLoading}
        isError={contents.isError}
        onOpenFolder={(folder) =>
          navigate(`/rooms/${roomId}/folders/${folder.id}`)
        }
        onUploaded={handleUploaded}
      />
    </div>
  );
}
