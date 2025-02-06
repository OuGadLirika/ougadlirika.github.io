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