export const CHATBOT_OPEN_EVENT = 'bizgrant:open-chatbot';

export function openChatbot() {
  window.dispatchEvent(new CustomEvent(CHATBOT_OPEN_EVENT));
}
