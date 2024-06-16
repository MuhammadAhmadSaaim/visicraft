"use client";

import { ReactNode } from "react";
import {
    LiveblocksProvider,
    RoomProvider,
    ClientSideSuspense,
} from "@liveblocks/react/suspense";

export function Room({ children }: { children: ReactNode }) {
    return (
        <LiveblocksProvider publicApiKey={"pk_dev_i4P7KjCXj1gukrqDrnCch_9d4m0BniVjoBsETafNw6Zh5B_nLZWm-TLOIIRT7dXc"}>
            <RoomProvider id="my-room" initialPresence={{}}>
                <ClientSideSuspense fallback={<div>Loading…</div>}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}