export async function requestFormApi(url, options = {}) {
  const response = await fetch(url, {
    ...options, credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(12000)
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "The form is unavailable. Please try again.");
  return data;
}

export function bindMessageForm(root, { onSuccess, successMessage, submitLabel, sendingLabel }) {
  const form = root.querySelector("[data-message-form]");
  const status = root.querySelector("[data-form-status]");
  const count = root.querySelector("[data-form-count]");
  const submit = form.querySelector('[type="submit"]');
  const message = form.elements.namedItem("message");
  const fields = ["name", "email", "message", "website"].map(name => form.elements.namedItem(name)).filter(Boolean);
  let submitting = false;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    submit.disabled = true;
    submit.textContent = sendingLabel;
    fields.forEach(field => { field.readOnly = true; });
    form.setAttribute("aria-busy", "true");
    status.textContent = "";
    status.classList.remove("is-error");
    try {
      const payload = Object.fromEntries(fields.map(field => [field.name, field.value]));
      const data = await requestFormApi(root.dataset.apiUrl, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      onSuccess(data);
      message.value = "";
      form.elements.namedItem("website").value = "";
      count.textContent = "0 / 1,000";
      status.textContent = successMessage;
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = error instanceof TypeError || error.name === "TimeoutError"
        ? "Could not reach the form. Your message is still here; please try again."
        : error.message;
    } finally {
      submitting = false;
      submit.disabled = false;
      submit.textContent = submitLabel;
      fields.forEach(field => { field.readOnly = false; });
      form.setAttribute("aria-busy", "false");
    }
  });
  message.addEventListener("input", () => { count.textContent = `${message.value.length} / 1,000`; });
  submit.disabled = false;
}
