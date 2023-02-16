export const slideTemplate = `
    <% _.each(images, function(image) { %>
        <% if (image.type === 'video') { %>
            <li class="cs-slide-gallery__slide cs-slide-gallery__slide--video">
                <div class="cs-slide-gallery__picture-wrapper">
                    <picture class="cs-slide-gallery__picture cs-slide-gallery__picture--video">
                        <div data-video-teaser='{"url": "<%= image.videoUrl %>","type": "youtube"}'></div>
                        <img type="<%= imageParams.imageMimeType %>" src="<%= image.img %>" alt="<%= image.caption %>" width="<%= imageParams.imageWidth %>" height="<%= imageParams.imageHeight %>" class="cs-slide-gallery__img" <% if (image.i > 3) { %>loading="lazy"<% } %> ></img>
                    </picture>
                </div>
            </li>
        <% } else { %>
            <li class="cs-slide-gallery__slide">
                <div class="cs-slide-gallery__picture-wrapper">
                    <div class="cs-slide-gallery__picture cs-slide-gallery__picture--base">
                        <% if (image.i < 2) { %>
                            <img type="<%= imageParams.imageMimeType %>" src="<%= image.img %>" alt="<%= image.caption %>" width="<%= imageParams.imageWidth %>" height="<%= imageParams.imageHeight %>" class="cs-slide-gallery__img"></img>
                        <% } else { %>
                            <img type="<%= imageParams.imageMimeType %>" src="<%= image.loaderImage %>" data-src="<%= image.img %>" alt="<%= image.caption %>" width="<%= imageParams.imageWidth %>" height="<%= imageParams.imageHeight %>" class="cs-slide-gallery__img lazyload"></img>
                        <% } %>
                    </div>
                    <div class="cs-slide-gallery__picture cs-slide-gallery__picture--full">
                        <img type="<%= imageParams.imageMimeType %>" src="<%= image.full %>" alt="<%= image.caption %>" width="<%= imageParams.imageFullWidth %>" height="<%= imageParams.imageFullHeight %>" class="cs-slide-gallery__img"></img>
                    </div>
                </div>
            </li>
        <% } %>
    <% }); %>`;

export const thumbnailTemplate = `
    <% _.each(images, function(image) { %>
        <% if (image.type === 'video') { %>
            <li class="cs-slide-gallery__thumb cs-slide-gallery__thumb--video">
        <% } else { %>
            <li class="cs-slide-gallery__thumb">
        <% } %>
            <img type="<%= imageParams.imageMimeType %>" src="<%= image.thumb %>" alt="<%= image.caption %>" width="<%= imageParams.imageSmallWidth %>" height="<%= imageParams.imageSmallHeight %>" class="cs-slide-gallery__thumb-img"></img>
        </li>
    <% }); %>`;
