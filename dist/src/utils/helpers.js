export const isGenericMessageEvent = (msg) => msg.subtype === undefined;
export const isMessageItem = (item) => item.type === 'message';
