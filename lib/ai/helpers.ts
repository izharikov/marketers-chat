import { UIMessageStreamWriter } from "ai";

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