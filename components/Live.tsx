import { use, useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursor/LiveCursors"
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@liveblocks/react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingButton";
import useInterval from "@/hooks/useInterval";
import { X } from "lucide-react";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden,
    })

    const [reactions, setReactions] = useState<Reaction[]>([]);

    const setReaction = useCallback((reaction: string) => {
        setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    const broadcast = useBroadcastEvent();

    useInterval(() => {
        setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
    }, 1000);


    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            // concat all the reactions created on mouse click
            setReactions((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: cursorState.reaction,
                        timestamp: Date.now(),
                    },
                ])
            );

            // Broadcast the reaction to other users
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100);

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReactions((reactions) =>
            reactions.concat([
                {
                    point: { x: event.x, y: event.y },
                    value: event.value,
                    timestamp: Date.now(),
                },
            ])
        );
    });

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {

            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({ cursor: { x, y } });
        }
    }, [])

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({ mode: CursorMode.Hidden })

        updateMyPresence({ cursor: null, message: null });
    }, [])

    const handlePointerDown = useCallback(
        (event: React.PointerEvent) => {
            // get the cursor position in the canvas
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({
                cursor: {
                    x,
                    y,
                },
            });

            // if cursor is in reaction mode, set isPressed to true
            setCursorState((state: CursorState) =>
                cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
            );
        },
        [cursorState.mode, setCursorState]
    );

    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
        );
    }, [cursorState.mode, setCursorState]);

    useEffect(() => {
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                })
            } else if (event.key === "Escape") {
                setCursorState({
                    mode: CursorMode.Hidden,
                })
            } else if (event.key === "e") {
                setCursorState({
                    mode: CursorMode.ReactionSelector,
                })
            }
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === '/') {
                event.preventDefault;
            }
        }

        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("keydown", onKeyDown);
        }
    }, [updateMyPresence])

    return (
        <div onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerLeave={handlePointerLeave}
            onPointerUp={handlePointerUp}
            className="h-[100vh] w-full flex justify-center items-center text-center">

            <h1 className="text-3xl text-white">VisiCraft</h1>

            {reactions.map((r) => {
                return (
                    <FlyingReaction
                        key={r.timestamp.toString()}
                        x={r.point.x}
                        y={r.point.y}
                        timestamp={r.timestamp}
                        value={r.value}
                    />
                );
            })}

            {cursor && (
                <CursorChat
                    cursor={cursor}
                    cursorState={cursorState}
                    setCursorState={setCursorState}
                    updateMyPresence={updateMyPresence}
                />
            )}

            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={(reaction) => {
                        setReaction(reaction);
                    }}
                />
            )}
            <LiveCursors others={others} />
        </div>
    )
}

export default Live
