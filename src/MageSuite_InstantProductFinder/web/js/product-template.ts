export const productTemplate = `
    <a href="<%= url%>" class="cs-product-tile cs-instant-product-finder__product active" id="product-<%= sku %>" target="_blank">
        <div class="cs-product-tile__container">
            <div class="cs-product-tile__thumbnail">
                <figure class="cs-product-tile__figure">
                    <picture class="cs-product-tile__image">
                        <img class="cs-product-tile__img" src="<%= image_url%>" loading="lazy" />
                    </picture>
                </figure>
            </div>
            <div class="cs-product-tile__content">
                <div class="cs-product-tile__main">
                    <div class="cs-product-tile__name">
                        <span class="cs-product-tile__name-link"><%= name %></span>
                    </div>
                    <div class="cs-product-tile__price">
                        <span class="price-box">
                            <span class="price"><%= final_price %></span>
                        </span>
                    </div>
                    <div class="cs-product-tile__stock cs-product-tile__more">More info</div>
                </div>
            </div>
        </div>
    </a>
`;
