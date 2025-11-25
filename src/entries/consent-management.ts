import consentManagement from 'components/consent-management';

// Usage with RequireJS:
// define(['mgsConsentManagement'], function(consentManagement) {
// You can now use the consentManagement:
// const hasConsent = consentManagement.mgsConsentManagement().checkConsent('serviceName');
// console.log('User consent status:', hasConsent);
export function mgsConsentManagement() {
    return consentManagement;
}
