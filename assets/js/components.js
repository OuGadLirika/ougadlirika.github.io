const linkComponent = (title, icon_classes, url) => {
  return `
    <div>
        <a href="${url}" target="_blank" class="links">
        <i class="${icon_classes} links-in"></i>
        ${title}</a>
    </div>
  `
}

const linkAdComponent = (title, icon_classes, url) => {
  return `
    <div>
        <a href="${url}" target="_blank" class="ad">
        <i class="${icon_classes} links-in"></i>
        ${title}</a>
    </div>
  `
}

document.addEventListener("DOMContentLoaded", function () {
  VANTA.BIRDS({
      el: "#desktop-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: window.innerHeight,
      minWidth: window.innerWidth,
      scale: 1.00,
      scaleMobile: 1.00,
      backgroundColor: 0x000000,
      color2: 0xa4ff
  });
});