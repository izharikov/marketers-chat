import { UIMessageStreamWriter } from 'ai';

export function writeText(writer: UIMessageStreamWriter, id: string, text: string) {
    writer.write({
        type: 'text-start',
        id,
    });
    writer.write({
        type: 'text-delta',
        id,
        delta: text
    });
    writer.write({
        type: 'text-end',
        id,
    });
}

export function helpers(writer: UIMessageStreamWriter) {
    return {
        start: () => writer.write({
            type: 'start-step',
        }),
        finish: () => writer.write({
            type: 'finish',
            finishReason: 'stop',
        }),
        toolInput: ({ toolCallId, toolName, input }: { toolCallId: string, toolName: string, input: unknown }, finish: boolean = true) => {
            writer.write({
                type: 'tool-input-available',
                toolCallId,
                toolName,
                input,
            });
            if (finish) {
                writer.write({
                    type: 'finish',
                    finishReason: 'tool-calls',
                });
            }
        }
    }
}