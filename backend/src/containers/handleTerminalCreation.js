export const handleTerminalCreation = (container, ws) => {
    if (!container) {
        console.error("❌ Container not found");
        ws.close();
        return;
    }

    container.exec(
        {
            Cmd: ["/bin/bash"],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,          // 🔴 RAW TTY MODE
            User: "sandbox",
        },
        (err, exec) => {
            if (err) {
                console.error("❌ Error creating exec:", err);
                ws.close();
                return;
            }

            exec.start({ hijack: true }, (err, stream) => {
                if (err) {
                    console.error("❌ Error starting exec:", err);
                    ws.close();
                    return;
                }

                console.log("🟢 Terminal shell started");

                // 🔹 BACKEND → FRONTEND (RAW OUTPUT)
                stream.on("data", (chunk) => {
                    if (ws.readyState === ws.OPEN) {
                        ws.send(chunk.toString());
                    }
                });

                // 🔹 FRONTEND → BACKEND (USER INPUT)
                ws.on("message", (data) => {
                    stream.write(data);
                });

                ws.on("close", () => {
                    stream.end();
                });
            });
        }
    );
};
