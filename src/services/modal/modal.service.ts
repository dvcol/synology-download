/**
 * Open a modal popup for complex download actions
 */
export const open = () => {
    const modal = document.createElement("dialog");
    modal.setAttribute("style", "padding: 0;border: 0;");
    modal.innerHTML = `<iframe id="popupContainer" style="display:flex;border:0;"></iframe>`;
    document.body.appendChild(modal);

    const dialog = document.querySelector("dialog") as any;
    dialog.showModal();

    const iframe = document.getElementById("popupContainer") as HTMLIFrameElement;
    iframe.src = chrome.extension.getURL("index.html");
    iframe.style.minHeight = '60vh';
    iframe.style.minWidth = '60vh';

    dialog.addEventListener("click", (e: any) => {
        const rect = e.target.getBoundingClientRect();
        const minX = rect.left + e.target.clientLeft;
        const minY = rect.top + e.target.clientTop;
        if ((e.clientX < minX || e.clientX >= minX + e.target.clientWidth) ||
            (e.clientY < minY || e.clientY >= minY + e.target.clientHeight)) {
            e.target.close();
        }
    });
}
