link_container = document.getElementById("link-container")
link_ad_container = document.getElementById("link-ad-container")

name_component = document.getElementById("name_component")
description_component = document.getElementById("description_component")

description_meta = document.getElementById("description-meta")
title_meta = document.getElementById("title-meta")


name_component.innerText = config.Name
description_component.innerText = config.Description
document.title = config.Title
description_meta = config.Description
title_meta = config.Title


for (let i = 0; i < config.links.length; i++) {
    link_container.innerHTML += linkComponent(config.links[i].Title, config.links[i].icon_classes, config.links[i].URL)
}

for (let i = 0; i < config.links_ad.length; i++) {
    link_ad_container.innerHTML += linkAdComponent(config.links_ad[i].Title, config.links_ad[i].icon_classes, config.links_ad[i].URL);
}