export const storeItemTemplate = `
<div class="cs-store-locator__item <% if (area) { %>cs-store-locator__item--<%= area %><% } %>" <% if (sourceCode) { %>data-id="<%= sourceCode %>"<% } %> <% if (latitude) { %>data-lat="<%= latitude %>"<% } %> <% if (longitude) { %>data-lng="<%= longitude %>" data-role="storelocator-item"<% } %>>
    <div class="cs-store-locator__store-details-close" data-role="storelocator-sidebar-close"></div>
    <div class="cs-store-locator__item-content">
        <div class="cs-store-locator__item-header">
            <% if (title) { %>
                <h2 class="cs-store-locator__item-name"><%= title %></h2>
            <% } %>
            <% if (routeLink) { %>
                <a href="<%= routeLink %>" target="_blank" rel="noopener noreferrer" class="cs-store-locator__item-route">
                    <span><%= routeLabel %></span>
                </a>
            <% } %>
        </div>
        <% if (postCode || city || street) { %>
            <p class="cs-store-locator__item-address">
                <%= postCode %> <%= city %>, <%= street %>
            </p>
        <% } %>
        <% if (phone) { %>
            <p class="cs-store-locator__item-phone">
                <%= phoneLabel %>: <a href="tel:<%= phone %>"><%= phone %></a>
            </p>
        <% } %>
        <% if (fax) { %>
            <p class="cs-store-locator__item-fax">
                <%= faxLabel %>: <a href="fax:<%= fax %>"><%= fax %></a>
            </p>
        <% } %>
        <% if (email) { %>
            <p class="cs-store-locator__item-email">
                <%= emailLabel %>: <a href="mailto:<%= email %>"><%= email %></a>
            </p>
        <% } %>
        <% if (url) { %>
            <p class="cs-store-locator__item-website">
                <%= urlLabel %>: <a href="//<%= url %>" target="_blank" rel="nofollow"><%= url %></a>
            </p>
        <% } %>
        <% if (description) { %>
            <p class="cs-store-locator__item-description">
                <%= description %>
            </p>
        <% } %>
    </div>
    <% if (openingHours) { %>
        <p class="cs-store-locator__item-opening-hours">
            <%= openingHours %>
        </p>
    <% } %>
    <div class="cs-store-locator__item-footer">
        <% if (distance) { %>
            <span class="cs-store-locator__item-distance">
                <%= distanceLabel %>: <%= distance %> km
            </span>
        <% } %>
    </div>
</div>
`;
