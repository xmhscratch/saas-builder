module.exports = {
    cms: `localdomain.${process.env.TLD || 'com'}`,
    assetApp: `assetx.localdomain.${process.env.TLD || 'com'}`,
    assetVendor: `asset-vendor.localdomain.${process.env.TLD || 'com'}`,
    account: `account.localdomain.${process.env.TLD || 'com'}`,
    oauth: `oauth.localdomain.${process.env.TLD || 'com'}`,
    api: `api.localdomain.${process.env.TLD || 'com'}`,
    integration: `integration.localdomain.${process.env.TLD || 'com'}`,
    invoice: `invoice.localdomain.${process.env.TLD || 'com'}`,

    cluster: {
        cms: `system_cms_app:3000`,
        assetApp: `system_asset_app:3150`,
        assetVendor: `system_asset_vendor_app:3115`,
        account: `system_account_app:3010`,
        oauth: `system_oauth_app:3999`,
        api: `system_api_app:3500`,
        integration: `system_integration_app:3999`,
        invoice: `system_invoice_app:3510`,
    },

    oauth: {
        api: `system_api_app:3500`,
        integration: `system_integration_app:3999`,
        invoice: `system_invoice_app:3510`,
    },
}
