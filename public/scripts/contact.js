import { bindMessageForm } from "./message-form.js";

export function createContactForm(root) {
  bindMessageForm(root, {
    submitLabel: "Send message", sendingLabel: "Sending...",
    successMessage: "Thanks! Your private message has been received.",
    onSuccess(data) {
      if (data.received !== true) throw new Error("Your message could not be confirmed. Please try again later.");
    }
  });
}
