/**
 * Consent management overlay template.
 *
 * Used in components such as StoreLocator and Instagram, if consent is required
 * Allows dynamic injection of consent text and an optional class modifier for styling purposes.
 */
export const consentTemplate = `
<div class="cs-consent-management
    <% if (typeof classModifier !== 'undefined' && classModifier) { %>
        <%= classModifier %>
    <% } %>
">
    <div class="cs-consent-management__wrapper">
        <span class="cs-consent-management__text">
            <%= text %>
        </span>
    </div>
</div>
`;
