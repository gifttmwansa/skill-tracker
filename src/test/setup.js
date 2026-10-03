import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom doesn't implement <dialog>, so provide the bits the app uses.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close ??= function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
}

window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "";
});
