declare global {
  interface Window {
    devMode: boolean;
    toggleDevMode: () => void;
  }
}

const rainbowBgCss =
  "background: linear-gradient(to right, #ffdee9, #fff1c1, #e0ffcb, #c3f7fa, #deeaff, #e9d6fe, #ffe7fa);";
// text drop shadow
const textDropShadowCss = "text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);";
// text bold and readable (sans-serif)
const textBoldReadableCss =
  "font-weight: bold; font-size: 24px; font-family: sans-serif;";
export function devModeUsage() {
  console.log(
    `
%cSince you're curious enough to check out the devTools, here's a little secret:
You can toggle the hidden dev tool by updating the value of the devMode variable :-)`,
    // rainbow background
    rainbowBgCss + "; " + textDropShadowCss + "; " + textBoldReadableCss
  );
}

export function toggleDevMode() {
  window.devMode = !window.devMode;
  // using a custom event to signal our react component of the change
  document.dispatchEvent(
    new CustomEvent("devModeChanged", { detail: window.devMode })
  );
  console.log(
    `
%cDev mode is now ${window.devMode ? "enabled" : "disabled"}`,
    rainbowBgCss + "; " + textDropShadowCss + "; " + textBoldReadableCss
  );
}

window.devMode = false;
window.toggleDevMode = toggleDevMode;
