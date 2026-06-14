export async function copyToClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return;
  }

  await navigator.clipboard.writeText(text);
}
